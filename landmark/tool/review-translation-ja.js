/**
 * 한일 번역 검수 및 선택적 재번역 스크립트
 * 
 * 1단계: 한국어 원본과 일본어 번역을 비교하여 문제 탐지
 * 2단계: 문제있는 항목만 고급 모델(Sonnet)로 재번역
 */

const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Anthropic = require("@anthropic-ai/sdk").default;
const fs = require("fs");

// API 키 확인
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY가 설정되지 않았습니다!");
  console.error("   .env 파일에 ANTHROPIC_API_KEY=sk-... 를 추가하세요.");
  process.exit(1);
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

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
const JA_DB_PATH = path.join(__dirname, "..", "db_ja.js");
const OUTPUT_PATH = path.join(__dirname, "..", "db_ja.js");
const REPORT_PATH = path.join(__dirname, "review-report-ja.json");

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
async function reviewTranslationBatch(koItems, jaItems) {
  const pairs = koItems.map((ko, i) => ({
    id: ko.id,
    name_ko: ko.name,
    name_zh: jaItems[i].name,
    summary_ko: ko.summary,
    summary_zh: jaItems[i].summary,
    description_ko: ko.description,
    description_zh: jaItems[i].description,
    tips_ko: ko.tips,
    tips_zh: jaItems[i].tips
  }));

  const systemPrompt = `You are an expert translation quality reviewer for Korean to Simplified Japanese tourism content.

Your task is to compare Korean originals with Japanese translations and identify ANY issues:

1. **Mistranslation**: Meaning changed or wrong
2. **Omission**: Important information missing
3. **Awkward phrasing**: Unnatural Japanese that sounds like translation
4. **Over-translation**: Added information not in original
5. **Tone mismatch**: Too formal/informal for tourism content
6. **Cultural context lost**: Korean concepts poorly explained

For each landmark, respond with:
- "OK" if translation is excellent (A+ quality)
- Or list specific issues with field name and explanation

Be strict - we want A+ quality translations suitable for professional tourism guides.`;

  const userPrompt = `Review these Korean→Japanese translations:

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
  const fieldsToTranslate = {
    name: koItem.name,
    summary: koItem.summary,
    description: koItem.description,
    tips: koItem.tips
  };

  const userPrompt = `You are a professional Korean to Simplified Japanese translator for Seoul tourism content.

TASK: Translate this Korean content to natural Simplified Japanese for mainland Japanese tourists.

KOREAN ORIGINAL:
- name: "${koItem.name}"
- summary: "${koItem.summary}"
- description: "${koItem.description}"
- tips: ${JSON.stringify(koItem.tips)}

ISSUES TO FIX:
${issues.map(i => `- ${i.field}: ${i.type} - ${i.problem}`).join('\n')}

RULES:
1. Use natural Simplified Japanese (日本語)
2. Fix all issues listed above
3. Keep cultural terms with brief explanations
4. Return ONLY valid JSON, no other text

OUTPUT FORMAT (strict JSON only):
{"name":"日本語名","summary":"概要","description":"説明","tips":["ヒント1","ヒント2","ヒント3","ヒント4"]}`;

  try {
    const response = await client.messages.create({
      model: CONFIG.RETRANSLATE_MODEL,
      max_tokens: 2000,
      messages: [
        { role: "user", content: userPrompt }
      ]
    });

    totalUsage.input_tokens += response.usage.input_tokens;
    totalUsage.output_tokens += response.usage.output_tokens;

    let text = response.content[0].text.trim();
    
    // markdown 코드 블록 제거
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0]
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/'/g, "'")
        .replace(/\n/g, ' ')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      try {
        return JSON.parse(jsonStr);
      } catch (e1) {
        // 더 공격적인 정리
        jsonStr = jsonStr.replace(/\s+/g, ' ');
        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error(`    파싱 실패: ${e2.message.substring(0, 50)}`);
        }
      }
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
async function reviewScoreReasons(koItem, jaItem) {
  const systemPrompt = `You are reviewing Korean→Simplified Japanese translations of tourism rating explanations.

Compare the Korean original with Japanese translation for each category.
Identify any mistranslations, awkward phrasing, or lost meaning.
Check if any Korean text remains untranslated.

Be strict - we want professional quality.`;

  const userPrompt = `Landmark: ${koItem.name} (${koItem.id})

Korean score_reasons:
${JSON.stringify(koItem.score_reasons, null, 2)}

Japanese score_reasons:
${JSON.stringify(jaItem.score_reasons, null, 2)}

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
  const jaData = loadDBFile(JA_DB_PATH);
  console.log(`  ✓ 한국어: ${koData.length}개`);
  console.log(`  ✓ 일본어: ${jaData.length}개\n`);

  // ID로 매핑
  const jaMap = new Map(jaData.map(item => [item.id, item]));

  // 2. 기본 필드 검수 (배치로 처리)
  console.log("📋 기본 필드 검수 중...");
  const allIssues = [];
  
  for (let i = 0; i < koData.length; i += CONFIG.BATCH_SIZE) {
    const batch = koData.slice(i, i + CONFIG.BATCH_SIZE);
    const jaBatch = batch.map(ko => jaMap.get(ko.id));
    
    process.stdout.write(`  검수 중: ${i + 1}-${Math.min(i + CONFIG.BATCH_SIZE, koData.length)}/${koData.length}...`);
    
    const result = await reviewTranslationBatch(batch, jaBatch);
    
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
    console.log("❌ 먼저 검수를 실행하세요: node review-translation-ja.js");
    return;
  }

  let report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf8"));
  
  if (report.issues.length === 0) {
    console.log("✅ 수정할 항목이 없습니다.");
    return;
  }

  console.log(`🔄 ${report.issues.length}개 항목 재번역 시작...\n`);

  const koData = loadDBFile(KO_DB_PATH);
  let jaData = loadDBFile(JA_DB_PATH);
  const koMap = new Map(koData.map(item => [item.id, item]));
  
  let fixedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < report.issues.length; i++) {
    const issue = report.issues[i];
    const koItem = koMap.get(issue.id);
    const jaIndex = jaData.findIndex(e => e.id === issue.id);
    
    if (!koItem || jaIndex === -1) continue;

    console.log(`  [${i+1}/${report.issues.length}] ${koItem.name} 재번역 중...`);
    
    const newTranslation = await retranslateItem(koItem, issue.issues);
    
    if (newTranslation) {
      // 기존 데이터 업데이트
      if (newTranslation.name) jaData[jaIndex].name = newTranslation.name;
      if (newTranslation.summary) jaData[jaIndex].summary = newTranslation.summary;
      if (newTranslation.description) jaData[jaIndex].description = newTranslation.description;
      if (newTranslation.tips) jaData[jaIndex].tips = newTranslation.tips;
      
      fixedCount++;
      console.log(`    ✓ 완료`);
      
      // 성공한 항목 리포트에서 제거하고 즉시 저장
      report.issues.splice(i, 1);
      i--;  // 인덱스 조정
      report.timestamp = new Date().toISOString();
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
      
      // DB도 즉시 저장
      saveDBFile(OUTPUT_PATH, jaData, "ja");
    } else {
      console.log(`    ❌ 실패`);
      failedCount++;
    }

    await new Promise(r => setTimeout(r, 500));
  }
  
  const cost = calculateCost(totalUsage.input_tokens, totalUsage.output_tokens, CONFIG.RETRANSLATE_MODEL);
  
  console.log(`\n✅ 재번역 완료: ${fixedCount}개 성공, ${failedCount}개 실패`);
  console.log(`💰 재번역 비용: $${cost.toFixed(4)}`);
  console.log(`📄 저장됨: ${OUTPUT_PATH}`);
  
  if (report.issues.length > 0) {
    console.log(`\n⚠️  ${report.issues.length}개 남음 - 다시 시도: node review-translation-ja.js --fix`);
  }
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
