const fs = require('fs');

function cleanEscapedQuotes(obj) {
  if (typeof obj === 'string') {
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

function containsKorean(text) {
  if (typeof text !== 'string') return false;
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
}

function isEnglishOnly(text) {
  if (typeof text !== 'string') return false;
  const hasAsianChars = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
  const hasLatinChars = /[a-zA-Z]/.test(text);
  return !hasAsianChars && hasLatinChars;
}

// 파일 로드
const content = fs.readFileSync('../db_zh.js', 'utf8');
const match = content.match(/const\s+landmarkData_\w+\s*=\s*(\[[\s\S]*\]);?$/m);
const rawData = JSON.parse(match[1]);
const data = cleanEscapedQuotes(rawData);

// 가로수길 찾기
const garosu = data.find(d => d.id === 'garosu');

console.log('=== 가로수길 score_reasons 검사 ===\n');

const sr = garosu.score_reasons;
let problemFound = false;

for (const [key, sentences] of Object.entries(sr)) {
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const hasKo = containsKorean(s);
    const isEn = isEnglishOnly(s);
    
    if (hasKo || isEn) {
      problemFound = true;
      const reason = hasKo ? '한국어 포함' : '영어만';
      console.log(`❌ ${key}[${i}]: ${reason}`);
      console.log(`   "${s.substring(0, 50)}..."\n`);
    }
  }
}

if (!problemFound) {
  console.log('✓ 모든 항목 정상 (중국어로 번역됨)');
}
