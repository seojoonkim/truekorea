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

// 일본어 DB 로드
const content = fs.readFileSync('../db_ja.js', 'utf8');
const match = content.match(/const\s+landmarkData_\w+\s*=\s*(\[[\s\S]*\]);?$/m);
const rawData = JSON.parse(match[1]);
const data = cleanEscapedQuotes(rawData);

// 성수동 찾기
const seongsu = data.find(d => d.id === 'seongsu' || (d.name && d.name.includes('聖水')));

if (!seongsu) {
  console.log('성수동을 찾을 수 없습니다.');
  console.log('ID 목록:', data.slice(0, 20).map(d => d.id));
  process.exit(1);
}

console.log('=== 성수동 score_reasons 검사 (일본어) ===\n');
console.log('ID:', seongsu.id);
console.log('Name:', seongsu.name);

const sr = seongsu.score_reasons;
if (!sr) {
  console.log('score_reasons 없음!');
  process.exit(1);
}

let problemFound = false;
for (const [key, sentences] of Object.entries(sr)) {
  if (!Array.isArray(sentences)) {
    console.log('X ' + key + ': 배열 아님!');
    problemFound = true;
    continue;
  }
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const hasKo = containsKorean(s);
    const isEn = isEnglishOnly(s);
    
    if (hasKo || isEn) {
      problemFound = true;
      const reason = hasKo ? '한국어 포함' : '영어만';
      console.log('X ' + key + '[' + i + ']: ' + reason);
      console.log('   "' + s.substring(0, 50) + '..."');
      console.log('');
    }
  }
}

if (!problemFound) {
  console.log('OK 모든 항목 정상 (일본어로 번역됨)');
}
