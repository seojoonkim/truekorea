/**
 * Seoul Landmarks Database Translator
 * 
 * 한국어 DB를 기준으로 영어/중국어/일본어 번역이 누락된 필드를 
 * Claude API를 사용하여 고품질 번역합니다.
 * 
 * 사용법: 
 *   1. .env 파일에 ANTHROPIC_API_KEY 설정
 *   2. node translate-landmarks.js --lang=ja --model=claude-sonnet-4-20250514
 * 
 * 옵션:
 *   --lang: 번역 대상 언어 (en, ja, zh)
 *   --model: Claude 모델 선택
 *   --dry-run: 실제 API 호출 없이 테스트
 *   --limit: 처리할 랜드마크 개수 제한
 *   --start: 시작 인덱스
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ============================================
// 설정
// ============================================

const CONFIG = {
  // API 설정
  API_KEY: process.env.ANTHROPIC_API_KEY,
  API_URL: 'https://api.anthropic.com/v1/messages',
  
  // 모델별 설정 (가격: input/output per 1M tokens)
  MODELS: {
    'claude-sonnet-4-20250514': {
      name: 'Claude Sonnet 4',
      inputPrice: 3.00,
      outputPrice: 15.00,
      maxTokens: 8192,
      quality: '★★★★★ 최고급 번역 품질, 뉘앙스 완벽 반영'
    },
    'claude-3-5-haiku-20241022': {
      name: 'Claude 3.5 Haiku',
      inputPrice: 0.80,
      outputPrice: 4.00,
      maxTokens: 8192,
      quality: '★★★★☆ 우수한 번역 품질, 비용 효율적'
    }
  },
  
  // 번역 대상 필드 (주소는 영어 DB에서만 관리, 일본어/중국어에서는 제외)
  TRANSLATABLE_FIELDS: [
    'summary',
    'description', 
    'tips',
    'admission',
    'hours',
    'closed',
    'duration',
    'district',
    'nearest_station',
    'name',
    'score_reasons'
  ],
  
  // 영어 외 언어에서 제거할 필드 (프론트에서 영어 DB fallback)
  REMOVE_FOR_NON_ENGLISH: [
    'road_address',
    'jibun_address'
  ],
  
  // 배치 처리
  BATCH_SIZE: 3,
  DELAY_MS: 1000,
  
  // 파일 경로
  INPUT_DIR: process.env.INPUT_DIR || './input',
  OUTPUT_DIR: process.env.OUTPUT_DIR || './output'
};

// ============================================
// 프롬프트 템플릿
// ============================================

const TRANSLATION_PROMPTS = {
  en: {
    systemPrompt: `You are an expert translator specializing in Korean to English translation for tourism content. Your translations should be:

1. **Natural & Fluent**: Write as a native English speaker would, not a direct translation
2. **Tourism-Oriented**: Use engaging, inviting language suitable for travel guides
3. **Culturally Adapted**: 
   - Keep Korean proper nouns (place names, station names) but add romanization
   - Explain cultural concepts briefly if needed
   - Convert Korean time formats, currencies appropriately
4. **Consistent Terminology**:
   - 한복 → hanbok (traditional Korean attire)
   - 고궁 → royal palace / historic palace
   - 맛집 → popular restaurant / must-try restaurant
   - 힙플레이스 → trendy spot / hipster spot
   - 야경 → night view / nightscape
   - 인생샷 → perfect photo / Instagram-worthy shot
   - 혼밥 → dining alone / solo dining
   - 데이트 코스 → date spot / romantic outing
5. **Address Format**: 
   - Korean: "서울특별시 종로구 사직로 161"
   - English: "161 Sajik-ro, Jongno-gu, Seoul"
6. **Station Names**: 
   - Korean: "경복궁역 5번출구"
   - English: "Gyeongbokgung Station Exit 5"

IMPORTANT: 
- Maintain the exact JSON structure
- Do not translate coordinates, IDs, or numerical scores
- Keep array structures intact
- Ensure all strings are properly escaped`,

    userPromptTemplate: (koData, existingTranslation) => `Translate the following Korean landmark data to English. 

KOREAN SOURCE DATA:
${JSON.stringify(koData, null, 2)}

${existingTranslation ? `EXISTING TRANSLATION (update untranslated Korean fields only):
${JSON.stringify(existingTranslation, null, 2)}` : ''}

Return ONLY the translated JSON object, no explanations.`
  },

  zh: {
    systemPrompt: `你是一位专业的韩中翻译专家，专门从事旅游内容翻译。你的翻译应该：

1. **自然流畅**：使用地道的简体中文表达，避免翻译腔
2. **旅游导向**：使用吸引人的、适合旅游指南的语言风格
3. **文化适应**：
   - 韩国专有名词使用中文汉字表记
   - 必要时简要解释文化概念
   - 适当转换时间格式和货币
4. **术语一致性**：
   - 한복 → 韩服
   - 고궁 → 古宫/皇宫
   - 맛집 → 美食店/网红餐厅
   - 힙플레이스 → 网红地/潮流地
   - 야경 → 夜景
   - 인생샷 → 人生照/绝美照片
   - 혼밥 → 独自用餐
   - 데이트 코스 → 约会路线
5. **地址格式**：
   - 韩文: "서울특별시 종로구 사직로 161"
   - 中文: "首尔特别市 钟路区 社稷路 161号"
6. **地铁站名**：
   - 韩文: "경복궁역 5번출구"
   - 中文: "景福宫站 5号出口"
7. **地名翻译** (非常重要!)：
   - 所有韩文地名必须翻译成中文汉字
   - 잠원 → 蚕院, 반포 → 盘浦, 여의도 → 汝矣岛
   - 강남 → 江南, 홍대 → 弘大, 이태원 → 梨泰院
   - 쌈지길 → 三寸街, 뚝섬 → 纛岛, 성수 → 城水
   - **如果原文有括号内的韩文注释，翻译时删除括号部分**
   - 例：原文 "쌈지길" → 译文 "三寸街"（不要写成 "三寸街(쌈지길)" 或 "三寸街(三寸街)"）
   - 绝对不能在中文翻译中留下任何韩文字符
8. **食品/文化用语**：
   - 김치 → 泡菜, 비빔밥 → 拌饭, 떡볶이 → 炒年糕
   - 막걸리 → 米酒, 소주 → 烧酒, 삼겹살 → 五花肉
   - 只写中文译名，不要添加任何韩文注释

重要提示：
- 保持JSON结构完全一致
- 不要翻译坐标、ID或数字评分
- 保持数组结构不变
- 字符串中的引号「"」必须转义为「\\"」
- 换行符必须转义为「\\n」
- 只返回有效的JSON
- **最终结果不能包含任何韩文字符(한글)**`,

    userPromptTemplate: (koData, existingTranslation) => `将以下韩国地标数据翻译成简体中文。

韩文源数据：
${JSON.stringify(koData, null, 2)}

${existingTranslation ? `现有翻译（仅更新未翻译的韩文字段）：
${JSON.stringify(existingTranslation, null, 2)}` : ''}

重要: 只返回有效的JSON对象。字符串中的引号必须正确转义。不要解释。`
  },

  ja: {
    systemPrompt: `あなたは韓国語から日本語への観光コンテンツ翻訳を専門とするプロの翻訳者です。翻訳は以下の点に注意してください：

1. **自然で流暢な表現**：直訳ではなく、日本人が書くような自然な日本語で
2. **観光向けの表現**：旅行ガイドにふさわしい、魅力的で親しみやすい表現
3. **文化的な適応**：
   - 韓国の固有名詞は韓国語読みのカタカナ表記
   - 必要に応じて文化的な概念を簡潔に説明
   - 時間形式や通貨を適切に変換
4. **用語の統一**：
   - 한복 → ハンボク（韓服）
   - 고궁 → 古宮/王宮
   - 맛집 → 人気店/グルメスポット
   - 힙플레이스 → おしゃれスポット/ヒップスポット
   - 야경 → 夜景
   - 인생샷 → 最高の一枚/映え写真
   - 혼밥 → 一人ご飯
   - 데이트 코스 → デートコース
5. **住所形式**：
   - 韓国語: "서울특별시 종로구 사직로 161"
   - 日本語: "ソウル特別市 鍾路区 社稷路 161"
6. **駅名**：
   - 韓国語: "경복궁역 5번출구"
   - 日本語: "景福宮駅 5番出口"
7. **地名の翻訳（非常に重要！）**：
   - すべての韓国語地名をカタカナまたは日本語漢字に翻訳すること
   - 뚝섬 → トゥクソム, 잠원 → チャモン, 반포 → パンポ
   - 강남 → カンナム, 홍대 → ホンデ, 이태원 → イテウォン
   - 쌈지길 → サムジギル, 성수 → ソンス, 을지로 → ウルチロ
   - 括弧内の韓国語も必ず翻訳：(쌈지길) → (サムジギル)
   - 翻訳結果に韓国語（ハングル）を絶対に残さないこと
8. **食べ物・文化用語**：
   - 김치 → キムチ, 비빔밥 → ビビンバ, 떡볶이 → トッポッキ
   - 막걸리 → マッコリ, 소주 → ソジュ, 삼겹살 → サムギョプサル

重要：
- JSON構造を完全に維持すること
- 座標、ID、数値スコアは翻訳しないこと
- 配列構造を維持すること
- 文字列内の引用符「"」は必ず「\\"」にエスケープすること
- 改行は「\\n」にエスケープすること
- 有効なJSONのみを返すこと
- **最終結果に韓国語（ハングル）を含めないこと**`,

    userPromptTemplate: (koData, existingTranslation) => `以下の韓国のランドマークデータを日本語に翻訳してください。

韓国語ソースデータ：
${JSON.stringify(koData, null, 2)}

${existingTranslation ? `既存の翻訳（未翻訳の韓国語フィールドのみ更新）：
${JSON.stringify(existingTranslation, null, 2)}` : ''}

重要: 有効なJSONオブジェクトのみを返してください。文字列内の引用符は必ずエスケープしてください。説明は不要です。`
  }
};

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 한국어 텍스트 포함 여부 확인
 * 괄호 안에 한국어만 있는 경우는 허용 (번역기가 원문 병기)
 * 예: "三寸街(쌈지길)" → OK (괄호 안에 한국어만)
 * 예: "三寸街(쌈지길 거리)" → NG (괄호 안에 한국어+중국어)
 * 예: "쌈지길의 거리" → NG (괄호 밖에 한국어)
 */
function containsKorean(text) {
  if (typeof text !== 'string') return false;
  
  // 1. 괄호 안 내용 추출 및 검사
  const parenMatches = text.match(/\(([^)]*)\)|（([^）]*)）/g) || [];
  for (const match of parenMatches) {
    const inner = match.slice(1, -1); // 괄호 제거
    const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(inner);
    const hasOtherAsian = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(inner); // 일본어/중국어
    
    // 괄호 안에 한국어와 다른 아시아 문자가 섞여있으면 NG
    if (hasKorean && hasOtherAsian) {
      return true;
    }
  }
  
  // 2. 괄호 제거 후 본문 검사
  const textWithoutParens = text.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '');
  
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(textWithoutParens);
}

/**
 * 영어 텍스트인지 확인 (일본어/중국어가 아닌 영어만 있는 경우)
 */
function isEnglishOnly(text) {
  if (typeof text !== 'string') return false;
  // 한국어, 일본어(히라가나/가타카나/한자), 중국어(한자)가 없고 라틴 문자만 있으면 영어
  const hasAsianChars = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  const hasLatinChars = /[a-zA-Z]/.test(text);
  return !hasAsianChars && hasLatinChars;
}

/**
 * 대상 언어로 올바르게 번역되었는지 확인
 */
function isCorrectLanguage(text, targetLang) {
  if (typeof text !== 'string') return false;
  
  if (targetLang === 'ja') {
    // 일본어: 히라가나, 가타카나, 또는 한자가 있어야 함
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  } else if (targetLang === 'zh') {
    // 중국어: 한자가 있어야 함
    return /[\u4E00-\u9FFF]/.test(text);
  } else if (targetLang === 'en') {
    // 영어: 라틴 문자가 있어야 함
    return /[a-zA-Z]/.test(text);
  }
  return true;
}

/**
 * score_reasons의 필수 카테고리
 */
const REQUIRED_SCORE_CATEGORIES = [
  'crowdedness', 'photo', 'culture', 'activity', 'relaxation',
  'couple', 'family', 'solo', 'foreigner', 'accessibility'
];

/**
 * 객체에서 한국어가 포함된 필드 찾기
 */
function findUntranslatedFields(obj, targetLang, path = '') {
  const untranslated = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!CONFIG.TRANSLATABLE_FIELDS.includes(key) && !path.includes('score_reasons')) {
      continue;
    }
    
    if (typeof value === 'string') {
      if (containsKorean(value)) {
        untranslated.push({ path: currentPath, value, type: 'string' });
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string' && containsKorean(item)) {
          untranslated.push({ path: `${currentPath}[${index}]`, value: item, type: 'array-item' });
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      untranslated.push(...findUntranslatedFields(value, targetLang, currentPath));
    }
  }
  
  return untranslated;
}

/**
 * 번역이 필요한 필드만 추출 (언어 검사 강화)
 */
function extractFieldsForTranslation(koData, existingData, targetLang = 'ja') {
  const fieldsToTranslate = {};
  
  for (const field of CONFIG.TRANSLATABLE_FIELDS) {
    if (koData[field] === undefined) continue;
    
    // 기존 번역이 없으면 번역 필요
    if (!existingData || existingData[field] === undefined) {
      fieldsToTranslate[field] = koData[field];
      continue;
    }
    
    const existingValue = existingData[field];
    
    // 문자열인 경우
    if (typeof existingValue === 'string') {
      // 한국어가 포함되어 있거나, 영어로만 되어있으면 (잘못된 번역) 재번역
      if (containsKorean(existingValue) || (targetLang !== 'en' && isEnglishOnly(existingValue))) {
        fieldsToTranslate[field] = koData[field];
      }
    } 
    // 배열인 경우
    else if (Array.isArray(existingValue)) {
      const needsTranslation = existingValue.some(item => {
        if (typeof item !== 'string') return false;
        return containsKorean(item) || (targetLang !== 'en' && isEnglishOnly(item));
      });
      if (needsTranslation) {
        fieldsToTranslate[field] = koData[field];
      }
    }
    // 객체인 경우 (score_reasons)
    else if (typeof existingValue === 'object' && existingValue !== null) {
      if (field === 'score_reasons') {
        // score_reasons 완전성 검사 (디버그용 spotName 전달)
        const needsTranslation = checkScoreReasonsCompleteness(existingValue, koData[field], targetLang, koData.name);
        if (needsTranslation) {
          fieldsToTranslate[field] = koData[field];
        }
      } else {
        const hasKorean = checkObjectForKorean(existingValue);
        if (hasKorean) {
          fieldsToTranslate[field] = koData[field];
        }
      }
    }
  }
  
  return fieldsToTranslate;
}

/**
 * score_reasons 완전성 검사
 * - 모든 필수 카테고리가 있는지
 * - 각 카테고리에 올바른 언어로 번역되었는지
 * - 한국어나 영어가 남아있지 않은지
 */
function checkScoreReasonsCompleteness(existingScoreReasons, koScoreReasons, targetLang, spotName = '') {
  if (!koScoreReasons) return false;
  
  const koKeys = Object.keys(koScoreReasons);
  const DEBUG = process.env.DEBUG === 'true';
  
  for (const key of koKeys) {
    // 카테고리가 없으면 번역 필요
    if (!existingScoreReasons || !existingScoreReasons[key]) {
      if (DEBUG && spotName) console.log(`    [DEBUG] ${spotName}.${key}: 카테고리 없음`);
      return true;
    }
    
    // 배열이 아니거나 비어있으면 번역 필요
    if (!Array.isArray(existingScoreReasons[key]) || existingScoreReasons[key].length === 0) {
      if (DEBUG && spotName) console.log(`    [DEBUG] ${spotName}.${key}: 배열 아니거나 비어있음`);
      return true;
    }
    
    // 각 문장 검사
    for (let i = 0; i < existingScoreReasons[key].length; i++) {
      const sentence = existingScoreReasons[key][i];
      if (typeof sentence !== 'string') continue;
      
      // 한국어가 남아있으면 번역 필요
      if (containsKorean(sentence)) {
        if (DEBUG && spotName) console.log(`    [DEBUG] ${spotName}.${key}[${i}]: 한국어 - "${sentence.substring(0, 30)}..."`);
        return true;
      }
      
      // 일본어/중국어인데 영어만 있으면 번역 필요
      if (targetLang !== 'en' && isEnglishOnly(sentence)) {
        if (DEBUG && spotName) console.log(`    [DEBUG] ${spotName}.${key}[${i}]: 영어만 - "${sentence.substring(0, 30)}..."`);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 객체 내에 한국어가 있는지 재귀적으로 확인
 */
function checkObjectForKorean(obj) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string' && containsKorean(value)) {
      return true;
    } else if (Array.isArray(value)) {
      if (value.some(item => typeof item === 'string' && containsKorean(item))) {
        return true;
      }
    } else if (typeof value === 'object' && value !== null) {
      if (checkObjectForKorean(value)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 토큰 수 추정 (대략적)
 */
function estimateTokens(text) {
  // 한국어/중국어/일본어: 약 1.5 토큰/문자, 영어: 약 0.25 토큰/단어
  const str = typeof text === 'string' ? text : JSON.stringify(text);
  return Math.ceil(str.length * 0.5);
}

/**
 * 딜레이 함수
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// API 호출
// ============================================

async function callClaudeAPI(systemPrompt, userPrompt, model) {
  const response = await fetch(CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CONFIG.API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      max_tokens: CONFIG.MODELS[model].maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data;
}

/**
 * JSON 응답 파싱 (복구 로직 포함)
 */
function parseJSONResponse(responseText) {
  // JSON 블록 추출
  let jsonStr = responseText;
  
  // ```json ... ``` 형식 처리
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  
  // 앞뒤 공백 제거
  jsonStr = jsonStr.trim();
  
  // 사전 처리: 잘못된 이스케이프 시퀀스 수정
  // \' 는 JSON에서 유효하지 않음 -> ' 로 변환
  // 백슬래시가 1개든 여러개든 작은따옴표 앞의 것만 제거
  jsonStr = jsonStr.replace(/\\+(?=')/g, "");
  
  // 첫 번째 시도: 그대로 파싱
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // 복구 시도 계속
  }
  
  // 두 번째 시도: 문자열 내부의 특수 따옴표 및 이스케이프 안 된 따옴표 처리
  try {
    const fixed = fixQuotesInJsonStrings(jsonStr);
    return JSON.parse(fixed);
  } catch (e) {
    // 다음 시도
  }
  
  // 세 번째 시도: 모든 특수 따옴표를 작은따옴표로 변환
  try {
    let fixed = jsonStr
      .replace(/[\u201C\u201D\u300C\u300D\u300E\u300F]/g, "'");
    return JSON.parse(fixed);
  } catch (e) {
    // 다음 시도
  }
  
  // 네 번째 시도: 모든 특수 따옴표 제거
  try {
    let fixed = jsonStr
      .replace(/[\u201C\u201D\u300C\u300D\u300E\u300F]/g, "");
    return JSON.parse(fixed);
  } catch (e) {
    // 최종 실패
  }
  
  console.error('JSON 파싱 실패:', responseText.substring(0, 500));
  throw new Error('JSON 파싱 실패');
}

/**
 * JSON 문자열 내부의 따옴표 문제 수정
 */
function fixQuotesInJsonStrings(str) {
  let result = "";
  let inString = false;
  let escape = false;
  let stringStart = -1;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    
    if (escape) {
      result += char;
      escape = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escape = true;
      continue;
    }
    
    // JSON 구조의 따옴표 (문자열 시작)
    if (char === '"' && !inString) {
      inString = true;
      stringStart = i;
      result += char;
      continue;
    }
    
    // 문자열 종료 판단
    if (char === '"' && inString) {
      // 다음 non-whitespace 문자 확인
      let j = i + 1;
      while (j < str.length && /\s/.test(str[j])) j++;
      const nextNonWs = str[j];
      
      // JSON 구조 따옴표인 경우: 다음에 , ] } : 가 오면
      if (nextNonWs === ',' || nextNonWs === ']' || nextNonWs === '}' || nextNonWs === ':' || nextNonWs === undefined) {
        inString = false;
        result += char;
      } else {
        // 문자열 내부의 따옴표 - 이스케이프
        result += '\\"';
      }
      continue;
    }
    
    // 문자열 내부의 특수 따옴표
    if (inString) {
      // 중국어 따옴표: " (0x201C), " (0x201D)
      // 일본어 따옴표: 「 (0x300C), 」 (0x300D), 『 (0x300E), 』 (0x300F)
      if (code === 0x201C || code === 0x201D || 
          code === 0x300C || code === 0x300D || 
          code === 0x300E || code === 0x300F) {
        result += "'";  // 작은따옴표로 변환
        continue;
      }
    }
    
    result += char;
  }
  return result;
}

// ============================================
// 메인 번역 함수
// ============================================

async function translateLandmark(koData, existingData, targetLang, model) {
  const prompts = TRANSLATION_PROMPTS[targetLang];
  
  // 번역이 필요한 필드만 추출 (언어 전달)
  const fieldsToTranslate = extractFieldsForTranslation(koData, existingData, targetLang);
  
  if (Object.keys(fieldsToTranslate).length === 0) {
    return { data: existingData, usage: null, skipped: true };
  }
  
  // 번역할 필드 목록 표시 (score_reasons는 세부 항목 표시)
  const fieldDisplay = Object.keys(fieldsToTranslate).map(field => {
    if (field === 'score_reasons' && fieldsToTranslate[field]) {
      const subKeys = Object.keys(fieldsToTranslate[field]);
      return `score_reasons(${subKeys.join(',')})`;
    }
    return field;
  }).join(', ');
  
  console.log(`  → ${koData.name}: [${fieldDisplay}]`);
  
  // 임시 결과 (성공 시에만 최종 반영)
  let tempResult = existingData ? { ...existingData } : { ...koData };
  let totalUsage = { input_tokens: 0, output_tokens: 0 };
  let hasFailed = false;
  
  // score_reasons 분리
  const scoreReasons = fieldsToTranslate.score_reasons;
  const otherFields = { ...fieldsToTranslate };
  delete otherFields.score_reasons;
  
  // 1. score_reasons 외 필드 먼저 번역
  if (Object.keys(otherFields).length > 0) {
    try {
      const dataToTranslate = {
        id: koData.id,
        ...otherFields
      };
      
      const userPrompt = prompts.userPromptTemplate(dataToTranslate, null);
      const response = await callClaudeAPI(prompts.systemPrompt, userPrompt, model);
      const translatedFields = parseJSONResponse(response.content[0].text);
      
      for (const [key, value] of Object.entries(translatedFields)) {
        if (key !== 'id' && CONFIG.TRANSLATABLE_FIELDS.includes(key)) {
          tempResult[key] = value;
        }
      }
      
      if (response.usage) {
        totalUsage.input_tokens += response.usage.input_tokens;
        totalUsage.output_tokens += response.usage.output_tokens;
      }
      
      const fieldNames = Object.keys(otherFields).join(', ');
      console.log(`    ✓ 기본 필드 완료: [${fieldNames}]`);
    } catch (error) {
      console.log(`    ❌ 기본 필드 실패: ${error.message}`);
      hasFailed = true;
    }
  }
  
  // 2. score_reasons는 항목별로 분할 번역
  if (!hasFailed && scoreReasons && Object.keys(scoreReasons).length > 0) {
    tempResult.score_reasons = tempResult.score_reasons || {};
    
    const scoreKeys = Object.keys(scoreReasons);
    for (let i = 0; i < scoreKeys.length; i++) {
      const scoreKey = scoreKeys[i];
      const scoreData = scoreReasons[scoreKey];
      
      const dataToTranslate = {
        id: koData.id,
        score_reasons: {
          [scoreKey]: scoreData
        }
      };
      
      try {
        const userPrompt = prompts.userPromptTemplate(dataToTranslate, null);
        const response = await callClaudeAPI(prompts.systemPrompt, userPrompt, model);
        const translatedFields = parseJSONResponse(response.content[0].text);
        
        if (translatedFields.score_reasons && translatedFields.score_reasons[scoreKey]) {
          tempResult.score_reasons[scoreKey] = translatedFields.score_reasons[scoreKey];
        }
        
        if (response.usage) {
          totalUsage.input_tokens += response.usage.input_tokens;
          totalUsage.output_tokens += response.usage.output_tokens;
        }
        
        console.log(`    ✓ score_reasons.${scoreKey} (${i + 1}/${scoreKeys.length})`);
        
        // Rate limiting between score_reasons calls
        await delay(500);
        
      } catch (error) {
        console.log(`    ❌ score_reasons.${scoreKey} 실패: ${error.message}`);
        hasFailed = true;
        break; // 실패하면 나머지 항목 스킵
      }
    }
  }
  
  // 하나라도 실패하면 저장하지 않음
  if (hasFailed) {
    console.log(`    ⚠ 번역 실패 - 이 스팟은 저장하지 않고 건너뜁니다.`);
    return { data: null, usage: totalUsage, skipped: false, failed: true };
  }
  
  return {
    data: tempResult,
    usage: totalUsage,
    skipped: false,
    failed: false
  };
}

// ============================================
// 파일 처리
// ============================================

/**
 * DB 파일 로드 (JavaScript 변수 형태)
 */
function loadDBFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // const landmarkData_xx = [...] 형태에서 배열 추출
  const match = content.match(/const\s+landmarkData_\w+\s*=\s*(\[[\s\S]*\]);?$/m);
  if (!match) {
    throw new Error(`Invalid DB file format: ${filePath}`);
  }
  
  const data = JSON.parse(match[1]);
  
  // 기존 파일의 이스케이프된 따옴표 정리
  return cleanEscapedQuotes(data);
}

/**
 * DB 파일 저장
 */
function saveDBFile(filePath, data, lang) {
  // 영어가 아닌 경우 주소 필드 제거
  let finalData = data;
  if (lang !== 'en' && CONFIG.REMOVE_FOR_NON_ENGLISH) {
    finalData = data.map(item => {
      const cleaned = { ...item };
      for (const field of CONFIG.REMOVE_FOR_NON_ENGLISH) {
        delete cleaned[field];
      }
      return cleaned;
    });
  }
  
  // 문자열 내 불필요한 이스케이프 제거 (\" -> ')
  finalData = cleanEscapedQuotes(finalData);
  
  const varName = `landmarkData_${lang}`;
  const content = `// Seoul Landmarks Database - ${lang.toUpperCase()}
// ${finalData.length} locations
// Auto-translated on ${new Date().toISOString()}

const ${varName} = ${JSON.stringify(finalData, null, 2)};
`;
  
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * 객체 내 문자열에서 불필요한 이스케이프 따옴표 제거
 */
function cleanEscapedQuotes(obj) {
  if (typeof obj === 'string') {
    // \" -> ' 로 변환 (문자열 내부의 따옴표)
    return obj.replace(/\\"/g, "'");
  } else if (Array.isArray(obj)) {
    return obj.map(item => cleanEscapedQuotes(item));
  } else if (typeof obj === 'object' && obj !== null) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = cleanEscapedQuotes(value);
    }
    return cleaned;
  }
  return obj;
}

// ============================================
// 비용 계산
// ============================================

function calculateCost(inputTokens, outputTokens, model) {
  const modelConfig = CONFIG.MODELS[model];
  const inputCost = (inputTokens / 1000000) * modelConfig.inputPrice;
  const outputCost = (outputTokens / 1000000) * modelConfig.outputPrice;
  return inputCost + outputCost;
}

function formatCost(cost) {
  return `$${cost.toFixed(4)}`;
}

// ============================================
// CLI 인터페이스
// ============================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    lang: 'ja',
    model: 'claude-3-5-haiku-20241022',
    dryRun: false,
    limit: null,
    start: 0,
    inputDir: CONFIG.INPUT_DIR,
    outputDir: CONFIG.OUTPUT_DIR
  };
  
  for (const arg of args) {
    if (arg.startsWith('--lang=')) {
      options.lang = arg.split('=')[1];
    } else if (arg.startsWith('--model=')) {
      options.model = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--start=')) {
      options.start = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--input=')) {
      options.inputDir = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--estimate') {
      options.estimate = true;
    }
  }
  
  return options;
}

function printHelp() {
  console.log(`
Seoul Landmarks Database Translator
====================================

사용법:
  node translate-landmarks.js [옵션]

옵션:
  --lang=LANG       번역 대상 언어 (en, ja, zh) [기본: ja]
  --model=MODEL     Claude 모델 선택 [기본: claude-haiku-3-5-20241022]
  --dry-run         실제 API 호출 없이 테스트
  --limit=N         처리할 랜드마크 개수 제한
  --start=N         시작 인덱스 [기본: 0]
  --input=DIR       입력 파일 디렉토리 [기본: ./input]
  --output=DIR      출력 파일 디렉토리 [기본: ./output]
  --estimate        예상 비용만 계산
  --help, -h        도움말 표시

사용 가능한 모델:
${Object.entries(CONFIG.MODELS).map(([id, info]) => 
  `  ${id}
    - ${info.name}
    - 품질: ${info.quality}
    - 가격: $${info.inputPrice}/1M input, $${info.outputPrice}/1M output`
).join('\n')}

예제:
  # 일본어 번역 (Haiku 모델, 비용 효율적)
  node translate-landmarks.js --lang=ja --model=claude-haiku-3-5-20241022

  # 영어 번역 (Sonnet 모델, 고품질)
  node translate-landmarks.js --lang=en --model=claude-sonnet-4-20250514

  # 처음 5개만 테스트
  node translate-landmarks.js --lang=zh --limit=5

  # 비용 추정만
  node translate-landmarks.js --lang=ja --estimate
`);
}

function printEstimate(koData, existingData, targetLang, model) {
  console.log('\n📊 예상 비용 분석');
  console.log('='.repeat(50));
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let needsTranslation = 0;
  
  for (const ko of koData) {
    const existing = existingData.find(e => e.id === ko.id);
    const fieldsToTranslate = extractFieldsForTranslation(ko, existing);
    
    if (Object.keys(fieldsToTranslate).length > 0) {
      needsTranslation++;
      // 입력 토큰 (시스템 프롬프트 + 사용자 프롬프트)
      const systemTokens = estimateTokens(TRANSLATION_PROMPTS[targetLang].systemPrompt);
      const userTokens = estimateTokens(JSON.stringify(fieldsToTranslate));
      totalInputTokens += systemTokens + userTokens;
      
      // 출력 토큰 (번역된 결과, 입력의 약 1.2배 예상)
      totalOutputTokens += Math.ceil(userTokens * 1.2);
    }
  }
  
  const modelConfig = CONFIG.MODELS[model];
  const estimatedCost = calculateCost(totalInputTokens, totalOutputTokens, model);
  
  console.log(`대상 언어: ${targetLang.toUpperCase()}`);
  console.log(`사용 모델: ${modelConfig.name}`);
  console.log(`번역 품질: ${modelConfig.quality}`);
  console.log('-'.repeat(50));
  console.log(`총 랜드마크: ${koData.length}개`);
  console.log(`번역 필요: ${needsTranslation}개`);
  console.log(`이미 완료: ${koData.length - needsTranslation}개`);
  console.log('-'.repeat(50));
  console.log(`예상 입력 토큰: ${totalInputTokens.toLocaleString()}`);
  console.log(`예상 출력 토큰: ${totalOutputTokens.toLocaleString()}`);
  console.log(`예상 총 비용: ${formatCost(estimatedCost)}`);
  console.log('='.repeat(50));
  
  // 모델별 비용 비교
  console.log('\n📈 모델별 예상 비용 비교:');
  for (const [modelId, config] of Object.entries(CONFIG.MODELS)) {
    const cost = calculateCost(totalInputTokens, totalOutputTokens, modelId);
    const marker = modelId === model ? ' ← 선택됨' : '';
    console.log(`  ${config.name}: ${formatCost(cost)}${marker}`);
    console.log(`    품질: ${config.quality}`);
  }
}

// ============================================
// 메인 실행
// ============================================

async function main() {
  const options = parseArgs();
  
  console.log('\n🌏 Seoul Landmarks Database Translator');
  console.log('='.repeat(50));
  
  // API 키 확인
  if (!CONFIG.API_KEY) {
    console.error('❌ 오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.');
    console.error('   .env 파일에 API 키를 설정하거나 환경 변수로 지정하세요.');
    process.exit(1);
  }
  
  // 모델 확인
  if (!CONFIG.MODELS[options.model]) {
    console.error(`❌ 오류: 지원하지 않는 모델입니다: ${options.model}`);
    console.error('   사용 가능한 모델:', Object.keys(CONFIG.MODELS).join(', '));
    process.exit(1);
  }
  
  // 언어 확인
  if (!['en', 'ja', 'zh'].includes(options.lang)) {
    console.error(`❌ 오류: 지원하지 않는 언어입니다: ${options.lang}`);
    console.error('   사용 가능한 언어: en, ja, zh');
    process.exit(1);
  }
  
  // 파일 경로
  const koFilePath = path.join(options.inputDir, 'db_ko.js');
  const targetFilePath = path.join(options.inputDir, `db_${options.lang}.js`);
  const outputFilePath = path.join(options.outputDir, `db_${options.lang}.js`);
  
  // 파일 존재 확인
  if (!fs.existsSync(koFilePath)) {
    console.error(`❌ 오류: 한국어 DB 파일을 찾을 수 없습니다: ${koFilePath}`);
    process.exit(1);
  }
  
  // 출력 디렉토리 생성
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }
  
  console.log(`📂 입력 파일: ${koFilePath}`);
  console.log(`📂 대상 파일: ${targetFilePath}`);
  console.log(`📂 출력 파일: ${outputFilePath}`);
  console.log(`🌐 대상 언어: ${options.lang.toUpperCase()}`);
  console.log(`🤖 모델: ${CONFIG.MODELS[options.model].name}`);
  console.log(`⚡ 품질: ${CONFIG.MODELS[options.model].quality}`);
  
  // 데이터 로드
  console.log('\n📚 데이터 로드 중...');
  const koData = loadDBFile(koFilePath);
  console.log(`  ✓ 한국어 DB: ${koData.length}개 랜드마크`);
  
  let existingData = [];
  if (fs.existsSync(targetFilePath)) {
    existingData = loadDBFile(targetFilePath);
    console.log(`  ✓ 기존 ${options.lang.toUpperCase()} DB: ${existingData.length}개 랜드마크`);
  } else {
    console.log(`  ⚠ 기존 ${options.lang.toUpperCase()} DB 없음, 새로 생성`);
  }
  
  // 비용 추정만 실행
  if (options.estimate) {
    printEstimate(koData, existingData, options.lang, options.model);
    return;
  }
  
  // Dry run 모드
  if (options.dryRun) {
    console.log('\n🔍 Dry Run 모드 - 번역 필요한 항목 분석');
    let count = 0;
    for (const ko of koData) {
      const existing = existingData.find(e => e.id === ko.id);
      const fieldsToTranslate = extractFieldsForTranslation(ko, existing, options.lang);
      if (Object.keys(fieldsToTranslate).length > 0) {
        count++;
        console.log(`  ${ko.name}: ${Object.keys(fieldsToTranslate).join(', ')}`);
      }
    }
    console.log(`\n총 ${count}개 랜드마크 번역 필요`);
    printEstimate(koData, existingData, options.lang, options.model);
    return;
  }
  
  // 번역 실행
  console.log('\n📋 번역 필요 항목 분석 중...');
  
  // 먼저 전체 스캔하여 번역 필요한 항목 확인
  const needsTranslation = [];
  const alreadyComplete = [];
  
  for (let i = 0; i < koData.length; i++) {
    const ko = koData[i];
    const existing = existingData.find(e => e.id === ko.id);
    const fieldsToTranslate = extractFieldsForTranslation(ko, existing, options.lang);
    
    if (Object.keys(fieldsToTranslate).length > 0) {
      needsTranslation.push({ index: i, ko, existing, fields: fieldsToTranslate });
    } else {
      alreadyComplete.push(ko.name);
    }
  }
  
  console.log(`  ✓ 번역 완료: ${alreadyComplete.length}개`);
  console.log(`  → 번역 필요: ${needsTranslation.length}개`);
  
  if (needsTranslation.length === 0) {
    console.log('\n✅ 모든 항목이 이미 번역되었습니다!');
    return;
  }
  
  // 번역 필요 항목 미리보기
  console.log('\n📝 번역 대상 목록:');
  needsTranslation.forEach((item, idx) => {
    const fieldDisplay = Object.keys(item.fields).map(field => {
      if (field === 'score_reasons' && item.fields[field]) {
        const subKeys = Object.keys(item.fields[field]);
        return `score_reasons(${subKeys.length})`;
      }
      return field;
    }).join(', ');
    console.log(`  ${idx + 1}. ${item.ko.name}: [${fieldDisplay}]`);
  });
  
  console.log('\n🚀 번역 시작...\n');
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let translatedCount = 0;
  let failedCount = 0;
  const failedItems = [];
  
  // 현재 데이터 상태 (매번 저장할 데이터)
  let currentData = [...koData].map(ko => {
    const existing = existingData.find(e => e.id === ko.id);
    return existing || ko;
  });
  
  for (let i = 0; i < needsTranslation.length; i++) {
    const { index, ko, existing } = needsTranslation[i];
    
    try {
      const result = await translateLandmark(ko, existing, options.lang, options.model);
      
      // 사용량 추적 (실패해도)
      if (result.usage) {
        totalInputTokens += result.usage.input_tokens;
        totalOutputTokens += result.usage.output_tokens;
      }
      
      if (result.failed) {
        // 번역 실패 - 저장하지 않음
        failedCount++;
        failedItems.push(ko.name);
        console.log('');
      } else if (!result.skipped && result.data) {
        // 번역 성공 - 현재 데이터 업데이트 및 저장
        currentData[index] = result.data;
        translatedCount++;
        
        // 매 스팟마다 저장
        saveDBFile(outputFilePath, currentData, options.lang);
        
        const cost = calculateCost(totalInputTokens, totalOutputTokens, options.model);
        console.log(`    ✓ 저장 완료 (${translatedCount}/${needsTranslation.length - failedCount}) | 비용: ${formatCost(cost)}\n`);
        
        // Rate limiting
        await delay(CONFIG.DELAY_MS);
      }
      
    } catch (error) {
      console.error(`    ❌ 오류: ${error.message}`);
      console.log(`    ⚠ 이 항목을 건너뛰고 계속합니다...\n`);
      failedCount++;
      failedItems.push(ko.name);
    }
  }
  
  // 최종 리포트
  const totalCost = calculateCost(totalInputTokens, totalOutputTokens, options.model);
  console.log('='.repeat(50));
  console.log('📊 번역 완료 리포트');
  console.log('='.repeat(50));
  console.log(`번역 성공: ${translatedCount}개`);
  console.log(`번역 실패: ${failedCount}개`);
  console.log(`이미 완료: ${alreadyComplete.length}개`);
  console.log(`총 입력 토큰: ${totalInputTokens.toLocaleString()}`);
  console.log(`총 출력 토큰: ${totalOutputTokens.toLocaleString()}`);
  console.log(`총 비용: ${formatCost(totalCost)}`);
  console.log(`저장 위치: ${outputFilePath}`);
  
  if (failedItems.length > 0) {
    console.log('\n⚠ 실패한 항목 (다시 실행하면 재시도됩니다):');
    failedItems.forEach(name => console.log(`  - ${name}`));
  }
  
  console.log('='.repeat(50));
}

main().catch(console.error);
