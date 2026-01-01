# Seoul Landmarks Database Translator

Claude API를 사용하여 한국어 랜드마크 DB를 영어/일본어/중국어로 고품질 번역하는 도구입니다.

## 🚀 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. API 키 설정
cp .env.example .env
# .env 파일에서 ANTHROPIC_API_KEY 설정

# 3. 입력 파일 준비
mkdir input
# db_ko.js, db_en.js, db_ja.js, db_zh.js를 input/ 폴더에 복사

# 4. 비용 추정
npm run estimate:ja

# 5. 번역 실행
npm run translate:ja
```

## 📊 모델별 예상 비용 비교

| 모델 | 품질 | 입력 가격 | 출력 가격 | 108개 DB 예상 비용 |
|------|------|----------|----------|-------------------|
| **Claude Sonnet 4** | ★★★★★ 최고급 | $3.00/1M | $15.00/1M | ~$1.50-2.00 |
| **Claude 3.5 Haiku** | ★★★★☆ 우수 | $0.80/1M | $4.00/1M | ~$0.40-0.60 |

### 권장 사항

- **영어 번역**: Sonnet 4 권장 (자연스러운 표현 중요)
- **일본어 번역**: Sonnet 4 권장 (존경어/겸양어 처리)
- **중국어 번역**: Haiku도 충분 (간체자 번역은 상대적으로 간단)

## 🛠 사용법

### 기본 명령어

```bash
# 일본어 번역 (기본 모델: Haiku)
node translate-landmarks.js --lang=ja

# 영어 번역 (고품질 모델)
node translate-landmarks.js --lang=en --model=claude-sonnet-4-20250514

# 중국어 번역 (비용 효율)
node translate-landmarks.js --lang=zh --model=claude-haiku-3-5-20241022
```

### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--lang=LANG` | 대상 언어 (en, ja, zh) | ja |
| `--model=MODEL` | Claude 모델 | claude-haiku-3-5-20241022 |
| `--dry-run` | 실제 API 호출 없이 분석만 | false |
| `--estimate` | 예상 비용만 계산 | false |
| `--limit=N` | 처리할 개수 제한 | 전체 |
| `--start=N` | 시작 인덱스 | 0 |
| `--input=DIR` | 입력 디렉토리 | ./input |
| `--output=DIR` | 출력 디렉토리 | ./output |

### 테스트 실행

```bash
# 처음 3개만 테스트 (API 호출 없음)
node translate-landmarks.js --lang=ja --limit=3 --dry-run

# 처음 5개만 실제 번역
node translate-landmarks.js --lang=ja --limit=5
```

## 📁 파일 구조

```
tool/
├── translate-landmarks.js  # 메인 스크립트
├── package.json
├── .env.example           # 환경 변수 템플릿
├── .env                   # 실제 API 키 (생성 필요)
├── input/                 # 입력 파일
│   ├── db_ko.js          # 한국어 원본 (필수)
│   ├── db_en.js          # 영어 기존 번역
│   ├── db_ja.js          # 일본어 기존 번역
│   └── db_zh.js          # 중국어 기존 번역
└── output/               # 출력 파일
    ├── db_en.js
    ├── db_ja.js
    └── db_zh.js
```

## 🎯 번역 품질 특징

### 번역 프롬프트 최적화

1. **자연스러운 표현**: 직역이 아닌 현지화된 표현
2. **관광 콘텐츠 특화**: 여행 가이드에 적합한 매력적인 어조
3. **용어 일관성**: 
   - 한복 → hanbok / ハンボク / 韩服
   - 힙플레이스 → hipster spot / ヒップスポット / 网红地
   - 인생샷 → perfect photo / 人生ショット / 人生照
4. **주소/역명 현지화**:
   - KO: "경복궁역 5번출구"
   - EN: "Gyeongbokgung Station Exit 5"
   - JA: "景福宮駅 5番出口"
   - ZH: "景福宫站 5号出口"

### 스마트 번역 감지

- 이미 번역된 필드는 자동 스킵
- 한국어가 남아있는 필드만 선택적 번역
- 기존 번역 품질 유지

## ⚙️ 고급 설정

### 배치 처리 조정

`translate-landmarks.js`의 CONFIG 섹션에서 조정:

```javascript
const CONFIG = {
  BATCH_SIZE: 3,      // 동시 처리 개수
  DELAY_MS: 1000,     // API 호출 간 딜레이 (ms)
  // ...
};
```

### 번역 대상 필드 수정

```javascript
TRANSLATABLE_FIELDS: [
  'summary',
  'description', 
  'tips',
  'admission',
  // ... 필요한 필드 추가/제거
]
```

## 🔧 문제 해결

### API 키 오류
```
❌ 오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.
```
→ `.env` 파일에 유효한 API 키 설정

### JSON 파싱 오류
```
JSON 파싱 실패: ...
```
→ API 응답이 불완전할 수 있음. `--limit`으로 적은 수로 테스트

### Rate Limiting
```
API Error: 429 - Too Many Requests
```
→ `DELAY_MS`를 2000 이상으로 증가

## 📝 출력 예시

```
🌏 Seoul Landmarks Database Translator
==================================================
📂 입력 파일: ./input/db_ko.js
📂 대상 파일: ./input/db_ja.js
📂 출력 파일: ./output/db_ja.js
🌐 대상 언어: JA
🤖 모델: Claude 3.5 Haiku
⚡ 품질: ★★★★☆ 우수한 번역 품질, 비용 효율적

📚 데이터 로드 중...
  ✓ 한국어 DB: 108개 랜드마크
  ✓ 기존 JA DB: 108개 랜드마크

🚀 번역 시작...
  → 경복궁: 5개 필드 번역 중...
  → 창덕궁: 4개 필드 번역 중...
  ✓ 창경궁: 번역 완료됨, 스킵
  ...

📊 번역 완료 리포트
==================================================
번역 완료: 45개
스킵 (이미 완료): 63개
총 입력 토큰: 125,000
총 출력 토큰: 95,000
총 비용: $0.4800
==================================================
```

## 📄 라이선스

MIT License
