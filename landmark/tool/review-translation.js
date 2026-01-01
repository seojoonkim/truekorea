/**
 * 한영 번역 검수 및 선택적 재번역 스크립트
 * 
 * 1단계: 한국어 원본과 영어 번역을 비교하여 문제 탐지
 * 2단계: 문제있는 항목만 고급 모델(Sonnet)로 재번역
 */

require('dotenv').config();
const Anthropic = require("@anthropic-ai/sdk").default;
const fs = require("fs");
const path = require("path");

const client = new Anthropic();

// 설정
const CONFIG = {
  REVIEW_MODEL: "claude-sonnet-4-20250514",  // 검수용 고급 모델
  RETRANSLATE_MODEL: "claude-sonnet-4-20250514",  // 재번역용 고급 모델
  BATCH_SIZE: 5,  // 한 번에 검수할 랜드마크 수
  PRICES: {
    "claude-sonnet-4-20250514": { input: 3, output: 15 }  // per 1M tokens
  }
};

// 파일 경로
const KO_DB_PATH = path.join(__dirname, "..", "db_ko.js");
const EN_DB_PATH = path.join(__dirname, "..", "db_en.js");
const OUTPUT_PATH = path.join(__dirname, "..", "db_en.js");
const REPORT_PATH = path.join(__dirname, "review-report.json");

// 토큰 사용량 추적
let totalUsage = { input_tokens: 0, output_tokens: 0 };

/**
 * DB 파일 로드
 */
function loadDBFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/const\s+landmarkData_\w+\s*=\s*(\[[\s\S]*\]);?$/m);
  if (!match) {
    throw new Error(`Invalid DB file format: ${filePath}`);
  }
  return JSON.parse(match[1]);
}

/**
 * DB 파일 저장
 */
function saveDBFile(filePath, data, lang) {
  const varName = `landmarkData_${lang}`;
  const content = `// Seoul Landmarks Database - ${lang.toUpperCase()}
// ${data.length} locations
// Auto-reviewed on ${new Date().toISOString()}

const ${varName} = ${JSON.stringify(data, null, 2)};
`;
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * 비용 계산
 */
function calculateCost(inputTokens, outputTokens, model) {
  const prices = CONFIG.PRICES[model];
  const inputCost = (inputTokens / 1000000) * prices.input;
  const outputCost = (outputTokens / 1000000) * prices.output;
  return inputCost + outputCost;
}

/**
 * 번역 품질 검수 (배치)
 */
async function reviewTranslationBatch(koItems, enItems) {
  const pairs = koItems.map((ko, i) => ({
    id: ko.id,
    name_ko: ko.name,
    name_en: enItems[i].name,
    summary_ko: ko.summary,
    summary_en: enItems[i].summary,
    description_ko: ko.description,
    description_en: enItems[i].description,
    tips_ko: ko.tips,
    tips_en: enItems[i].tips
  }));

  const systemPrompt = `You are an expert translation quality reviewer for Korean to English tourism content.

Your task is to compare Korean originals with English translations and identify ANY issues:

1. **Mistranslation**: Meaning changed or wrong
2. **Omission**: Important information missing
3. **Awkward phrasing**: Unnatural English that sounds like translation
4. **Over-translation**: Added information not in original
5. **Tone mismatch**: Too formal/informal for tourism content
6. **Cultural context lost**: Korean concepts poorly explained

For each landmark, respond with:
- "OK" if translation is excellent (A+ quality)
- Or list specific issues with field name and explanation

Be strict - we want A+ quality translations suitable for professional tourism guides.`;

  const userPrompt = `Review these Korean→English translations:

${JSON.stringify(pairs, null, 2)}

For each landmark ID, respond in this JSON format:
{
  "reviews": [
    {
      "id": "landmark_id",
      "status": "OK" or "ISSUES",
      "issues": [
        {
          "field": "summary/description/tips/name",
          "type": "mistranslation/awkward/omission/etc",
          "problem": "specific problem description",
          "suggestion": "how to fix (optional)"
        }
      ]
    }
  ]
}

Only return valid JSON.`;

  try {
    const response = await client.messages.create({
      model: CONFIG.REVIEW_MODEL,
      max_tokens: 4000,
      messages: [
        { role: "user", content: systemPrompt + "\n\n" + userPrompt }
      ]
    });

    totalUsage.input_tokens += response.usage.input_tokens;
    totalUsage.output_tokens += response.usage.output_tokens;

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Review error:", error.message);
    return null;
  }
}

/**
 * 단일 항목 재번역 (고급 모델)
 */
async function retranslateItem(koItem, issues) {
  const systemPrompt = `You are a professional Korean to English translator specializing in Seoul tourism content.

Translate the following Korean landmark data to natural, engaging English suitable for international tourists.

Guidelines:
- Use natural, native-sounding English (not translation-style)
- Keep the tone warm, inviting, and informative
- Preserve cultural terms with brief explanations when needed
- Maintain the original meaning precisely
- Make it sound like it was written by a native English travel writer

Previous translation had these issues:
${JSON.stringify(issues, null, 2)}

Fix these issues in your translation.`;

  const fieldsToTranslate = {
    name: koItem.name,
    summary: koItem.summary,
    description: koItem.description,
    tips: koItem.tips
  };

  const userPrompt = `Translate this Korean tourism content to excellent English:

${JSON.stringify(fieldsToTranslate, null, 2)}

Return ONLY a valid JSON object with the translated fields:
{
  "name": "...",
  "summary": "...",
  "description": "...",
  "tips": [...]
}`;

  try {
    const response = await client.messages.create({
      model: CONFIG.RETRANSLATE_MODEL,
      max_tokens: 2000,
      messages: [
        { role: "user", content: systemPrompt + "\n\n" + userPrompt }
      ]
    });

    totalUsage.input_tokens += response.usage.input_tokens;
    totalUsage.output_tokens += response.usage.output_tokens;

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Retranslate error:", error.message);
    return null;
  }
}

/**
 * score_reasons 검수 (별도 처리 - 분량이 많음)
 */
async function reviewScoreReasons(koItem, enItem) {
  const systemPrompt = `You are reviewing Korean→English translations of tourism rating explanations.

Compare the Korean original with English translation for each category.
Identify any mistranslations, awkward phrasing, or lost meaning.

Be strict - we want professional quality.`;

  const userPrompt = `Landmark: ${koItem.name} (${koItem.id})

Korean score_reasons:
${JSON.stringify(koItem.score_reasons, null, 2)}

English score_reasons:
${JSON.stringify(enItem.score_reasons, null, 2)}

Review each category. Respond with JSON:
{
  "status": "OK" or "ISSUES",
  "problem_categories": ["category1", "category2"],
  "details": "brief explanation of main issues"
}

Only return valid JSON.`;

  try {
    const response = await client.messages.create({
      model: CONFIG.REVIEW_MODEL,
      max_tokens: 1000,
      messages: [
        { role: "user", content: systemPrompt + "\n\n" + userPrompt }
      ]
    });

    totalUsage.input_tokens += response.usage.input_tokens;
    totalUsage.output_tokens += response.usage.output_tokens;

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Score reasons review error:", error.message);
    return null;
  }
}

/**
 * 메인 실행
 */
async function main() {
  console.log("🔍 번역 품질 검수 시작...\n");
  
  // 1. 데이터 로드
  console.log("📚 데이터 로드 중...");
  const koData = loadDBFile(KO_DB_PATH);
  const enData = loadDBFile(EN_DB_PATH);
  console.log(`  ✓ 한국어: ${koData.length}개`);
  console.log(`  ✓ 영어: ${enData.length}개\n`);

  // ID로 매핑
  const enMap = new Map(enData.map(item => [item.id, item]));

  // 2. 기본 필드 검수 (배치로 처리)
  console.log("📋 기본 필드 검수 중...");
  const allIssues = [];
  
  for (let i = 0; i < koData.length; i += CONFIG.BATCH_SIZE) {
    const batch = koData.slice(i, i + CONFIG.BATCH_SIZE);
    const enBatch = batch.map(ko => enMap.get(ko.id));
    
    process.stdout.write(`  검수 중: ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, koData.length)}/${koData.length}...`);
    
    const result = await reviewTranslationBatch(batch, enBatch);
    
    if (result && result.reviews) {
      for (const review of result.reviews) {
        if (review.status === "ISSUES" && review.issues && review.issues.length > 0) {
          allIssues.push(review);
        }
      }
    }
    
    console.log(" ✓");
    
    // Rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 기본 필드 검수 결과: ${allIssues.length}개 문제 발견\n`);

  // 3. 문제있는 항목 출력
  if (allIssues.length > 0) {
    console.log("⚠️  문제 발견된 항목:");
    for (const issue of allIssues) {
      const koItem = koData.find(k => k.id === issue.id);
      console.log(`\n  📍 ${koItem?.name || issue.id} (${issue.id})`);
      for (const prob of issue.issues) {
        console.log(`     - [${prob.field}] ${prob.type}: ${prob.problem}`);
        if (prob.suggestion) {
          console.log(`       → ${prob.suggestion}`);
        }
      }
    }
  } else {
    console.log("✅ 모든 기본 필드 번역 품질 양호!");
  }

  // 4. 비용 리포트
  const cost = calculateCost(totalUsage.input_tokens, totalUsage.output_tokens, CONFIG.REVIEW_MODEL);
  console.log(`\n💰 검수 비용:`);
  console.log(`  입력: ${totalUsage.input_tokens.toLocaleString()} 토큰`);
  console.log(`  출력: ${totalUsage.output_tokens.toLocaleString()} 토큰`);
  console.log(`  총 비용: $${cost.toFixed(4)}`);

  // 5. 리포트 저장
  const report = {
    timestamp: new Date().toISOString(),
    total_landmarks: koData.length,
    issues_found: allIssues.length,
    issues: allIssues,
    usage: totalUsage,
    cost: cost
  };
  
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\n📄 리포트 저장: ${REPORT_PATH}`);

  // 6. 재번역 여부 확인
  if (allIssues.length > 0) {
    console.log(`\n🔄 ${allIssues.length}개 항목 재번역이 필요합니다.`);
    console.log("   재번역하려면: node review-translation.js --fix");
  }

  return { issues: allIssues, report };
}

/**
 * 재번역 실행
 */
async function fixIssues() {
  // 리포트 로드
  if (!fs.existsSync(REPORT_PATH)) {
    console.log("❌ 먼저 검수를 실행하세요: node review-translation.js");
    return;
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  
  if (report.issues.length === 0) {
    console.log("✅ 수정할 항목이 없습니다.");
    return;
  }

  console.log(`🔄 ${report.issues.length}개 항목 재번역 시작...\n`);

  const koData = loadDBFile(KO_DB_PATH);
  const enData = loadDBFile(EN_DB_PATH);
  const koMap = new Map(koData.map(item => [item.id, item]));
  
  let fixedCount = 0;

  for (const issue of report.issues) {
    const koItem = koMap.get(issue.id);
    const enIndex = enData.findIndex(e => e.id === issue.id);
    
    if (!koItem || enIndex === -1) continue;

    console.log(`  → ${koItem.name} 재번역 중...`);
    
    const newTranslation = await retranslateItem(koItem, issue.issues);
    
    if (newTranslation) {
      // 기존 데이터 업데이트
      if (newTranslation.name) enData[enIndex].name = newTranslation.name;
      if (newTranslation.summary) enData[enIndex].summary = newTranslation.summary;
      if (newTranslation.description) enData[enIndex].description = newTranslation.description;
      if (newTranslation.tips) enData[enIndex].tips = newTranslation.tips;
      
      fixedCount++;
      console.log(`    ✓ 완료`);
    } else {
      console.log(`    ❌ 실패`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  // 저장
  saveDBFile(OUTPUT_PATH, enData, "en");
  
  const cost = calculateCost(totalUsage.input_tokens, totalUsage.output_tokens, CONFIG.RETRANSLATE_MODEL);
  
  console.log(`\n✅ 재번역 완료: ${fixedCount}/${report.issues.length}개`);
  console.log(`💰 재번역 비용: $${cost.toFixed(4)}`);
  console.log(`📄 저장됨: ${OUTPUT_PATH}`);
}

// 실행
const args = process.argv.slice(2);
if (args.includes("--fix")) {
  fixIssues().catch(console.error);
} else {
  // 검수 후 문제 발견되면 자동 재번역
  main().then(async (result) => {
    if (result && result.issues && result.issues.length > 0) {
      console.log("\n" + "=".repeat(50));
      console.log("🔄 문제 발견! 자동 재번역 시작...");
      console.log("=".repeat(50) + "\n");
      await fixIssues();
    }
  }).catch(console.error);
}
