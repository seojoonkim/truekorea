// TrueKorea 확장 DB v2.0
// 시술 상세 정보 데이터베이스

const DB_EXTENDED = {
  version: "2.0",
  lastUpdated: "2025-01",
  
  treatments: [
    // ===== 1. 울쎄라 =====
    {
      id: "ulthera",
      name: "울쎄라",
      nameEn: "Ultherapy",
      brand: "Merz",
      category: "리프팅/타이트닝",
      subcategory: "HIFU",
      
      mechanism: {
        simple: "초음파로 피부 깊숙한 근막층을 자극해 콜라겐 재생을 유도하는 리프팅 시술",
        detailed: "고강도 집속 초음파(HIFU)가 피부 1.5~4.5mm 깊이의 SMAS 근막층에 60~70℃ 열응고점을 만들어 콜라겐 재생 및 피부 수축 유도",
        keywords: ["HIFU", "초음파", "SMAS", "콜라겐", "근막층"]
      },
      
      effects: {
        primary: ["턱선 리프팅", "이중턱 개선", "볼처짐 개선"],
        secondary: ["피부 탄력", "잔주름 완화", "모공 축소"],
        notFor: ["깊은 주름", "볼륨 채움", "색소 치료"],
        onsetTime: "1~2개월 후 서서히, 3~6개월 최대 효과",
        duration: "1~2년"
      },
      
      procedure: {
        duration: "60~90분",
        anesthesia: "마취크림 필수, 수면마취 권장",
        sessions: "1회",
        interval: "6개월~1년",
        shots: "300~600샷"
      },
      
      recovery: {
        painLevel: 4,
        painDescription: "시술 중 뼈 근처 찌릿한 통증, 수면마취 시 편안함",
        downtime: "없음~3일",
        commonSideEffects: ["일시적 붓기", "홍반", "뻐근함"],
        recoveryTips: ["당일 세안/화장 가능", "음주/사우나 3~7일 금지"]
      },
      
      suitability: {
        idealAge: "30대 후반~50대",
        bestFor: ["경미~중등도 피부 처짐", "턱선 무너진 분", "다운타임 없이 관리 원하는 분"],
        notRecommended: ["얼굴 살 거의 없는 분", "심한 처짐", "즉각 효과 원하는 분", "임산부"],
        skinType: "모든 피부 타입"
      },
      
      pros: ["FDA 승인", "비침습", "자연스러운 개선", "효과 오래 지속", "바로 일상 복귀"],
      cons: ["높은 가격(100~300만)", "시술 중 통증", "효과 서서히", "볼패임 위험(얼굴 살 적으면)"],
      
      safety: {
        commonSideEffects: ["붓기", "홍반", "뻐근함"],
        seriousSideEffects: ["볼패임", "화상(드묾)", "신경손상(일시적)"],
        contraindications: ["임신/수유", "시술부위 염증", "켈로이드"],
        warnings: ["정품팁 확인 필수", "숙련된 의사 선택"]
      },
      
      pricing: { range: "100~300만원", average: "150만원", factors: ["샷수", "부위", "병원"] },
      
      comparison: {
        vs: {
          "써마지": "울쎄라=깊은층 리프팅, 써마지=진피층 탄력",
          "슈링크": "울쎄라가 더 강력하고 비쌈, 슈링크는 가성비"
        },
        bestWith: ["써마지", "스킨부스터", "보톡스"]
      },
      
      tags: ["리프팅", "HIFU", "FDA승인", "프리미엄"]
    },

    // ===== 2. 써마지 =====
    {
      id: "thermage",
      name: "써마지",
      nameEn: "Thermage FLX",
      brand: "Solta Medical",
      category: "리프팅/타이트닝",
      subcategory: "RF",
      
      mechanism: {
        simple: "고주파(RF)로 피부 진피층에 열을 가해 콜라겐 재생과 탄력 개선",
        detailed: "모노폴라 RF가 진피층(2~3mm)에 균일한 열 전달, 기존 콜라겐 수축 + 새 콜라겐 생성",
        keywords: ["RF", "고주파", "콜라겐", "진피층", "모노폴라"]
      },
      
      effects: {
        primary: ["피부 탄력", "잔주름 완화", "모공 축소"],
        secondary: ["턱선 정리", "피부결 개선"],
        notFor: ["심한 처짐", "볼륨 채움"],
        onsetTime: "즉각 + 1~6개월 점진적 개선",
        duration: "1~2년"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "대부분 불필요",
        sessions: "1회",
        interval: "1년",
        shots: "300~900샷"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "따뜻~뜨거운 느낌, 참을만함",
        downtime: "없음",
        commonSideEffects: ["일시적 붓기", "홍반"],
        recoveryTips: ["바로 일상 가능"]
      },
      
      suitability: {
        idealAge: "30대~50대",
        bestFor: ["탄력 저하", "모공/피부결 고민", "통증 민감한 분", "얼굴 살 적은 분"],
        notRecommended: ["심한 처짐", "페이스메이커", "임산부"],
        skinType: "모든 피부 타입"
      },
      
      pros: ["통증 적음", "다운타임 없음", "즉각 탄력감", "볼패임 위험 낮음", "눈가 전용팁"],
      cons: ["높은 가격", "리프팅은 울쎄라보다 약함"],
      
      safety: {
        commonSideEffects: ["붓기", "홍반"],
        seriousSideEffects: ["화상(드묾)", "지방위축(매우 드묾)"],
        contraindications: ["페이스메이커", "임신", "금속 임플란트"],
        warnings: ["4세대 FLX 장비 확인", "정품팁 확인"]
      },
      
      pricing: { range: "80~200만원", average: "120만원", factors: ["샷수", "팁 종류"] },
      
      comparison: {
        vs: { "울쎄라": "써마지=탄력/피부결, 울쎄라=리프팅" },
        bestWith: ["울쎄라", "스킨부스터"]
      },
      
      tags: ["탄력", "RF", "고주파", "FDA승인", "저통증"]
    },

    // ===== 3. 슈링크 유니버스 =====
    {
      id: "shrink-universe",
      name: "슈링크 유니버스",
      nameEn: "Shurink Universe",
      brand: "Classys",
      category: "리프팅/타이트닝",
      subcategory: "HIFU",
      
      mechanism: {
        simple: "고강도 초음파로 근막층 자극해 리프팅, 울쎄라의 국산 대안",
        detailed: "HIFU 에너지로 SMAS층에 열응고점 형성, 7가지 카트리지로 맞춤 시술",
        keywords: ["HIFU", "초음파", "SMAS", "국산", "가성비"]
      },
      
      effects: {
        primary: ["리프팅", "턱선 개선", "이중턱"],
        secondary: ["탄력", "피부결"],
        notFor: ["볼륨", "색소"],
        onsetTime: "2~3주 후 시작, 2~3개월 최대",
        duration: "3~6개월"
      },
      
      procedure: {
        duration: "20~30분",
        anesthesia: "마취크림",
        sessions: "3~4회 권장",
        interval: "4~6주",
        shots: "300~600샷"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "울쎄라보다 덜 아픔",
        downtime: "없음",
        commonSideEffects: ["미세 붓기", "홍반"],
        recoveryTips: ["당일 세안/화장 가능", "찬물 세안 피하기"]
      },
      
      suitability: {
        idealAge: "20대 후반~40대",
        bestFor: ["예산 고려하는 분", "리프팅 입문", "유지 관리"],
        notRecommended: ["얼굴 살 없는 분", "즉각적 큰 효과 원하는 분"],
        skinType: "모든 피부 타입"
      },
      
      pros: ["가성비 좋음", "통증 적음", "국산 장비", "다양한 카트리지", "빠른 시술"],
      cons: ["효과 유지 짧음", "여러 번 시술 필요", "울쎄라보다 효과 약함"],
      
      safety: {
        commonSideEffects: ["붓기", "홍반", "화끈거림"],
        seriousSideEffects: ["볼패임", "화상(드묾)"],
        contraindications: ["임신", "피부 염증"],
        warnings: ["숙련된 시술자 중요 (영상출력 없음)"]
      },
      
      pricing: { range: "10~30만원/회", average: "15만원/회", factors: ["샷수", "부위"] },
      
      comparison: {
        vs: {
          "울쎄라": "슈링크 3~4회 ≒ 울쎄라 1회 효과, 가격은 1/3~1/5",
          "더블로": "비슷한 국산 HIFU"
        },
        bestWith: ["인모드", "스킨부스터"]
      },
      
      tags: ["리프팅", "HIFU", "국산", "가성비", "입문용"]
    },

    // ===== 4. 리쥬란 =====
    {
      id: "rejuran",
      name: "리쥬란",
      nameEn: "Rejuran Healer",
      brand: "Pharmaresearch",
      category: "스킨부스터",
      subcategory: "PN",
      
      mechanism: {
        simple: "연어 DNA(PN) 성분을 피부에 주입해 재생력을 높이는 시술",
        detailed: "폴리뉴클레오타이드(PN)가 진피층에서 세포 성장인자 분비 촉진, 콜라겐/엘라스틴 합성 유도",
        keywords: ["PN", "연어DNA", "재생", "스킨부스터"]
      },
      
      effects: {
        primary: ["피부 재생", "탄력 개선", "잔주름 완화"],
        secondary: ["피부결", "속건조 해결", "모공"],
        notFor: ["즉각 볼륨", "리프팅", "색소"],
        onsetTime: "2~4주 후 효과 시작",
        duration: "3~6개월"
      },
      
      procedure: {
        duration: "20~30분",
        anesthesia: "마취크림",
        sessions: "3~4회 권장",
        interval: "2~3주",
        method: "미세주사/기계주입"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "따끔거림",
        downtime: "1~3일",
        commonSideEffects: ["엠보싱(볼록)", "멍", "붓기"],
        recoveryTips: ["엠보싱 2~3일 내 흡수", "다음날부터 화장"]
      },
      
      suitability: {
        idealAge: "20대 후반~50대",
        bestFor: ["피부 재생력 저하", "속건조", "잔주름/탄력", "피부 컨디션 개선"],
        notRecommended: ["해산물 알러지", "켈로이드"],
        skinType: "모든 피부, 민감성도 가능"
      },
      
      pros: ["자연스러운 개선", "K-뷰티 대표", "안전성 검증", "다른 시술 병행 가능"],
      cons: ["엠보싱 1~3일 티남", "여러 회 필요", "효과 서서히"],
      
      safety: {
        commonSideEffects: ["엠보싱", "멍", "붓기"],
        seriousSideEffects: ["감염(드묾)", "알러지(매우 드묾)"],
        contraindications: ["연어/해산물 알러지", "임신/수유", "피부 감염"],
        warnings: ["정품 확인"]
      },
      
      pricing: { range: "15~30만원/회", average: "20만원/회", factors: ["용량", "부위"] },
      
      comparison: {
        vs: {
          "쥬베룩": "리쥬란=재생/탄력, 쥬베룩=볼륨/콜라겐",
          "물광주사": "리쥬란=재생, 물광=보습/즉각 윤기"
        },
        bestWith: ["레이저토닝", "리프팅", "보톡스"]
      },
      
      tags: ["스킨부스터", "재생", "PN", "K-뷰티", "연어주사"]
    },

    // ===== 5. 보톡스 =====
    {
      id: "botox",
      name: "보톡스",
      nameEn: "Botox",
      brand: "Allergan 외 다수",
      category: "주름/보톡스",
      subcategory: "보톡스",
      
      mechanism: {
        simple: "근육에 보툴리눔 톡신을 주입해 주름 완화 및 윤곽 개선",
        detailed: "보툴리눔 톡신이 신경-근육 접합부에서 아세틸콜린 분비 차단, 근육 이완으로 주름 개선",
        keywords: ["보툴리눔톡신", "근육이완", "주름", "윤곽"]
      },
      
      effects: {
        primary: ["표정주름 완화", "이마/미간/눈가", "턱 축소"],
        secondary: ["사각턱 개선", "승모근 축소", "다한증"],
        notFor: ["볼륨", "탄력", "색소"],
        onsetTime: "3~7일 후 효과 시작",
        duration: "3~6개월"
      },
      
      procedure: {
        duration: "10~20분",
        anesthesia: "대부분 불필요",
        sessions: "1회",
        interval: "3~6개월",
        method: "주사"
      },
      
      recovery: {
        painLevel: 1.5,
        painDescription: "따끔, 크게 아프지 않음",
        downtime: "없음",
        commonSideEffects: ["주사 자국", "미세 멍"],
        recoveryTips: ["4시간 눕지 않기", "당일 세안/화장 가능"]
      },
      
      suitability: {
        idealAge: "20대~60대",
        bestFor: ["표정주름", "사각턱", "승모근", "땀 많은 분"],
        notRecommended: ["임산부/수유", "신경근육질환", "해당 부위 감염"],
        skinType: "무관"
      },
      
      pros: ["빠른 효과", "시술 간단", "다운타임 없음", "다양한 부위 적용"],
      cons: ["효과 일시적(3~6개월)", "반복 시술 필요", "과다 시술 시 부자연스러움"],
      
      safety: {
        commonSideEffects: ["멍", "붓기", "두통"],
        seriousSideEffects: ["눈꺼풀 처짐(드묾)", "비대칭", "삼킴곤란(목 시술 시)"],
        contraindications: ["임신/수유", "신경근육질환", "보툴리눔 알러지"],
        warnings: ["정품 확인", "적정 용량 중요"]
      },
      
      pricing: { range: "3~15만원/부위", average: "5만원/부위", factors: ["부위", "용량", "브랜드"] },
      
      comparison: {
        vs: { "필러": "보톡스=근육/주름, 필러=볼륨/채움" },
        bestWith: ["필러", "리프팅", "스킨부스터"]
      },
      
      tags: ["주름", "보톡스", "윤곽", "간편", "입문"]
    },

    // ===== 6. 필러 =====
    {
      id: "filler",
      name: "필러",
      nameEn: "Dermal Filler",
      brand: "Juvederm, Restylane 외 다수",
      category: "필러/볼륨",
      subcategory: "HA필러",
      
      mechanism: {
        simple: "히알루론산(HA)을 피부에 주입해 볼륨 채우고 주름 개선",
        detailed: "가교결합된 HA가 진피/피하층에서 볼륨 유지, 수분 끌어당겨 탄력 부여",
        keywords: ["히알루론산", "HA", "볼륨", "주름"]
      },
      
      effects: {
        primary: ["볼륨 채움", "팔자주름", "입술/코/턱 윤곽"],
        secondary: ["물광", "잔주름"],
        notFor: ["리프팅", "탄력", "색소"],
        onsetTime: "즉각 효과",
        duration: "6개월~2년 (제품따라)"
      },
      
      procedure: {
        duration: "15~30분",
        anesthesia: "마취크림 또는 리도카인 함유 제품",
        sessions: "1회",
        interval: "6~12개월",
        method: "주사/캐뉼라"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "따끔~찌릿",
        downtime: "1~5일",
        commonSideEffects: ["붓기", "멍", "뭉침"],
        recoveryTips: ["냉찜질", "심한 운동 3일 피하기"]
      },
      
      suitability: {
        idealAge: "20대~60대",
        bestFor: ["꺼진 볼/팔자", "입술 볼륨", "코/턱 라인", "애교살"],
        notRecommended: ["켈로이드", "자가면역질환", "시술부위 염증"],
        skinType: "무관"
      },
      
      pros: ["즉각 효과", "자연스러운 볼륨", "녹일 수 있음(HA)", "다양한 부위"],
      cons: ["일시적 효과", "멍/붓기", "비용 누적", "과시술 시 부자연스러움"],
      
      safety: {
        commonSideEffects: ["붓기", "멍", "뭉침"],
        seriousSideEffects: ["혈관폐색(매우 드묾)", "감염", "육아종"],
        contraindications: ["자가면역질환", "켈로이드", "시술부위 감염"],
        warnings: ["정품 확인", "혈관해부학 숙지된 의사"]
      },
      
      pricing: { range: "20~80만원/cc", average: "40만원/cc", factors: ["제품", "부위", "양"] },
      
      comparison: {
        vs: { "보톡스": "필러=볼륨, 보톡스=근육/주름" },
        bestWith: ["보톡스", "리프팅", "스킨부스터"]
      },
      
      tags: ["볼륨", "필러", "HA", "즉각효과", "윤곽"]
    },

    // ===== 7. 인모드 =====
    {
      id: "inmode",
      name: "인모드",
      nameEn: "InMode",
      brand: "InMode",
      category: "리프팅/타이트닝",
      subcategory: "RF",
      
      mechanism: {
        simple: "고주파(RF)로 지방 감소와 피부 탄력 동시에 개선",
        detailed: "RF가 피부 온도 43도 이하로 유지하며 지방세포 파괴 + 콜라겐 재생",
        keywords: ["RF", "고주파", "지방감소", "탄력"]
      },
      
      effects: {
        primary: ["지방 감소", "턱선 개선", "V라인"],
        secondary: ["탄력", "피부결"],
        notFor: ["볼륨", "색소", "깊은주름"],
        onsetTime: "즉각 + 1~3개월 점진",
        duration: "6개월~1년"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "대부분 불필요",
        sessions: "3~6회 권장",
        interval: "2~4주",
        modes: ["Forma(탄력)", "FX(지방감소)"]
      },
      
      recovery: {
        painLevel: 1.5,
        painDescription: "따뜻한 느낌, 거의 무통",
        downtime: "없음",
        commonSideEffects: ["일시적 홍반"],
        recoveryTips: ["바로 일상 가능"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["턱살/이중턱", "볼살", "지방+탄력 동시 원하는 분"],
        notRecommended: ["페이스메이커", "임산부", "금속 임플란트"],
        skinType: "모든 피부"
      },
      
      pros: ["무통증", "다운타임 없음", "지방+탄력 동시", "즉각 효과"],
      cons: ["여러 회 필요", "효과 제한적(심한 처짐X)"],
      
      safety: {
        commonSideEffects: ["홍반", "열감"],
        seriousSideEffects: ["화상(매우 드묾)"],
        contraindications: ["페이스메이커", "임신", "피부 염증"],
        warnings: ["온도 모니터링 중요"]
      },
      
      pricing: { range: "15~40만원/회", average: "25만원/회", factors: ["모드", "부위"] },
      
      comparison: {
        vs: { "슈링크": "인모드=지방+탄력, 슈링크=리프팅 위주" },
        bestWith: ["슈링크", "스킨부스터"]
      },
      
      tags: ["지방감소", "RF", "V라인", "무통증", "턱선"]
    },

    // ===== 8. 쥬베룩 =====
    {
      id: "juvelook",
      name: "쥬베룩",
      nameEn: "Juvelook",
      brand: "Huons",
      category: "스킨부스터",
      subcategory: "PDLLA",
      
      mechanism: {
        simple: "PDLLA 성분이 콜라겐 생성을 유도해 볼륨과 탄력 개선",
        detailed: "Poly-D,L-lactic acid가 진피층에서 콜라겐 합성 촉진, 점진적 볼륨 증가",
        keywords: ["PDLLA", "콜라겐", "볼륨", "스킨부스터"]
      },
      
      effects: {
        primary: ["콜라겐 재생", "볼륨 개선", "모공 축소"],
        secondary: ["탄력", "피부결", "잔주름"],
        notFor: ["즉각 볼륨", "색소"],
        onsetTime: "4~6주 후 서서히",
        duration: "1~2년"
      },
      
      procedure: {
        duration: "20~30분",
        anesthesia: "마취크림",
        sessions: "2~4회",
        interval: "3~4주",
        method: "미세주사"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "따끔거림",
        downtime: "1~3일",
        commonSideEffects: ["엠보싱", "붓기", "멍"],
        recoveryTips: ["마사지 금지", "3일간 사우나 피하기"]
      },
      
      suitability: {
        idealAge: "30대~50대",
        bestFor: ["콜라겐 저하", "모공", "볼륨 감소", "자연스러운 채움"],
        notRecommended: ["켈로이드", "자가면역질환", "시술부위 염증"],
        skinType: "모든 피부"
      },
      
      pros: ["자연스러운 볼륨", "콜라겐 생성", "효과 오래 지속", "K-뷰티"],
      cons: ["결절 부작용 가능", "효과 느리게 나타남", "여러 회 필요"],
      
      safety: {
        commonSideEffects: ["엠보싱", "멍", "붓기"],
        seriousSideEffects: ["결절(뭉침)", "육아종"],
        contraindications: ["켈로이드", "자가면역질환"],
        warnings: ["과주입 주의", "마사지 금지"]
      },
      
      pricing: { range: "15~40만원/회", average: "25만원/회", factors: ["용량", "부위"] },
      
      comparison: {
        vs: { "리쥬란": "쥬베룩=볼륨/콜라겐, 리쥬란=재생/탄력" },
        bestWith: ["리쥬란", "리프팅", "보톡스"]
      },
      
      tags: ["스킨부스터", "콜라겐", "PDLLA", "볼륨", "K-뷰티"]
    },

    // ===== 9. 피코토닝 =====
    {
      id: "pico-toning",
      name: "피코토닝",
      nameEn: "Pico Toning",
      brand: "다양 (Picosure, Picocare 등)",
      category: "색소/미백",
      subcategory: "피코레이저",
      
      mechanism: {
        simple: "피코초 레이저로 색소를 잘게 부숴 기미/색소 개선",
        detailed: "피코초(10^-12초) 펄스가 멜라닌을 미세 입자로 파쇄, 대식세포가 흡수/배출",
        keywords: ["피코레이저", "색소", "기미", "토닝"]
      },
      
      effects: {
        primary: ["기미", "잡티", "색소침착"],
        secondary: ["피부톤 균일", "모공", "피부결"],
        notFor: ["리프팅", "볼륨", "주름"],
        onsetTime: "3~5회 후 효과 뚜렷",
        duration: "유지관리 필요"
      },
      
      procedure: {
        duration: "15~30분",
        anesthesia: "대부분 불필요",
        sessions: "5~10회",
        interval: "2~4주",
        method: "레이저 조사"
      },
      
      recovery: {
        painLevel: 1.5,
        painDescription: "따끔거림",
        downtime: "없음~1일",
        commonSideEffects: ["홍반", "열감"],
        recoveryTips: ["자외선 차단 필수", "보습"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["기미", "잡티", "색소침착", "피부톤 불균일"],
        notRecommended: ["일광화상 직후", "광과민증", "임산부"],
        skinType: "모든 피부, 민감성 주의"
      },
      
      pros: ["다운타임 적음", "통증 적음", "점진적 개선", "기미에 효과적"],
      cons: ["여러 회 필요", "재발 가능", "자외선 주의"],
      
      safety: {
        commonSideEffects: ["홍반", "열감", "일시적 색소침착"],
        seriousSideEffects: ["과색소침착(드묾)", "저색소침착"],
        contraindications: ["광과민증", "활동성 헤르페스", "임신"],
        warnings: ["자외선 차단 철저"]
      },
      
      pricing: { range: "5~15만원/회", average: "10만원/회", factors: ["장비", "부위"] },
      
      comparison: {
        vs: { "레이저토닝": "피코가 더 짧은 펄스로 효과적, 약간 비쌈" },
        bestWith: ["미백주사", "스킨부스터"]
      },
      
      tags: ["색소", "기미", "피코레이저", "미백", "토닝"]
    },

    // ===== 10. 레이저토닝 =====
    {
      id: "laser-toning",
      name: "레이저토닝",
      nameEn: "Laser Toning",
      brand: "다양 (Spectra, Helios 등)",
      category: "색소/미백",
      subcategory: "Nd:YAG",
      
      mechanism: {
        simple: "1064nm 레이저로 색소 파괴해 피부톤 개선",
        detailed: "Nd:YAG 레이저가 멜라닌에 선택적으로 작용, 색소 파쇄 및 배출 유도",
        keywords: ["레이저토닝", "색소", "1064nm", "Nd:YAG"]
      },
      
      effects: {
        primary: ["피부톤 개선", "잡티", "색소침착"],
        secondary: ["모공", "피부결"],
        notFor: ["깊은 기미", "리프팅", "볼륨"],
        onsetTime: "5~10회 후 효과",
        duration: "유지관리 필요"
      },
      
      procedure: {
        duration: "10~20분",
        anesthesia: "불필요",
        sessions: "10~20회",
        interval: "1~2주",
        method: "레이저 조사"
      },
      
      recovery: {
        painLevel: 1,
        painDescription: "거의 통증 없음",
        downtime: "없음",
        commonSideEffects: ["일시적 홍반"],
        recoveryTips: ["자외선 차단"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["피부톤 칙칙함", "잡티", "가벼운 색소", "관리 목적"],
        notRecommended: ["광과민증", "임산부"],
        skinType: "모든 피부"
      },
      
      pros: ["저렴함", "다운타임 없음", "통증 없음", "점심시간 시술"],
      cons: ["여러 회 필요", "효과 느림", "깊은 기미는 한계"],
      
      safety: {
        commonSideEffects: ["홍반"],
        seriousSideEffects: ["오히려 색소 진해짐(드묾)"],
        contraindications: ["광과민증", "피부 염증"],
        warnings: ["자외선 차단 필수"]
      },
      
      pricing: { range: "3~8만원/회", average: "5만원/회", factors: ["장비", "횟수"] },
      
      comparison: {
        vs: { "피코토닝": "피코가 더 효과적이지만 비쌈" },
        bestWith: ["스킨부스터", "필링"]
      },
      
      tags: ["색소", "토닝", "미백", "저렴", "관리용"]
    },

    // ===== 11. 프락셀 =====
    {
      id: "fraxel",
      name: "프락셀",
      nameEn: "Fraxel",
      brand: "Solta Medical",
      category: "흉터/모공",
      subcategory: "프락셔널",
      
      mechanism: {
        simple: "레이저로 피부에 미세 상처 만들어 재생 유도",
        detailed: "프락셔널 레이저가 미세 치료 영역(MTZ) 형성, 콜라겐 리모델링 및 새 피부 재생",
        keywords: ["프락셔널", "레이저", "재생", "흉터"]
      },
      
      effects: {
        primary: ["흉터 개선", "모공", "피부결"],
        secondary: ["잔주름", "색소침착"],
        notFor: ["리프팅", "볼륨"],
        onsetTime: "2~3회 후 효과",
        duration: "영구적 개선"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "마취크림 필수",
        sessions: "3~5회",
        interval: "4~8주",
        method: "레이저"
      },
      
      recovery: {
        painLevel: 3,
        painDescription: "따끔~화끈거림",
        downtime: "3~7일",
        commonSideEffects: ["홍반", "각질", "붓기"],
        recoveryTips: ["보습 철저", "자외선 차단", "각질 뜯지 않기"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["여드름 흉터", "모공", "피부결 울퉁불퉁", "잔주름"],
        notRecommended: ["켈로이드", "활동성 여드름", "임산부"],
        skinType: "모든 피부, 어두운 피부 주의"
      },
      
      pros: ["흉터에 효과적", "영구적 개선", "검증된 장비"],
      cons: ["다운타임 있음", "통증", "여러 회 필요", "비용"],
      
      safety: {
        commonSideEffects: ["홍반", "각질", "붓기", "색소침착"],
        seriousSideEffects: ["흉터 악화", "감염"],
        contraindications: ["켈로이드", "활동성 피부질환"],
        warnings: ["자외선 차단 필수"]
      },
      
      pricing: { range: "20~50만원/회", average: "35만원/회", factors: ["부위", "강도"] },
      
      comparison: {
        vs: { "MRF(스카펫 등)": "프락셀=레이저, MRF=RF+니들로 다운타임 더 적음" },
        bestWith: ["스킨부스터", "필링"]
      },
      
      tags: ["흉터", "모공", "프락셔널", "재생", "피부결"]
    },

    // ===== 12. 스카펫/포텐자 =====
    {
      id: "scarlet-potenza",
      name: "스카펫/포텐자",
      nameEn: "Scarlet/Potenza",
      brand: "Viol/Cynosure",
      category: "흉터/모공",
      subcategory: "MRF",
      
      mechanism: {
        simple: "마이크로니들 + RF로 흉터/모공 개선",
        detailed: "미세바늘이 진피층까지 침투해 RF 에너지 전달, 콜라겐 재생 유도",
        keywords: ["MRF", "마이크로니들", "RF", "흉터"]
      },
      
      effects: {
        primary: ["흉터", "모공", "탄력"],
        secondary: ["잔주름", "피부결"],
        notFor: ["리프팅", "색소"],
        onsetTime: "2~4주 후 효과 시작",
        duration: "1년 이상"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "마취크림 필수",
        sessions: "3~5회",
        interval: "4~6주",
        method: "MRF"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "따끔거림",
        downtime: "2~5일",
        commonSideEffects: ["홍반", "붓기", "미세출혈"],
        recoveryTips: ["보습", "자외선 차단"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["여드름 흉터", "모공", "탄력 저하", "프락셀 대안"],
        notRecommended: ["켈로이드", "활동성 여드름", "금속 임플란트"],
        skinType: "모든 피부"
      },
      
      pros: ["프락셀보다 다운타임 적음", "모든 피부톤 가능", "탄력도 개선"],
      cons: ["여러 회 필요", "통증", "비용"],
      
      safety: {
        commonSideEffects: ["홍반", "붓기", "미세출혈"],
        seriousSideEffects: ["감염", "흉터 악화"],
        contraindications: ["켈로이드", "금속 임플란트", "혈액응고장애"],
        warnings: ["위생 중요"]
      },
      
      pricing: { range: "25~60만원/회", average: "40만원/회", factors: ["장비", "부위"] },
      
      comparison: {
        vs: { "프락셀": "MRF=다운타임 적음, 프락셀=더 공격적" },
        bestWith: ["스킨부스터", "엑소좀"]
      },
      
      tags: ["흉터", "모공", "MRF", "탄력", "재생"]
    },

    // ===== 13. 물광주사 =====
    {
      id: "skinbooster-ha",
      name: "물광주사",
      nameEn: "Skin Booster",
      brand: "Restylane, Belotero 등",
      category: "스킨부스터",
      subcategory: "HA",
      
      mechanism: {
        simple: "히알루론산을 피부 얕은 층에 주입해 수분과 윤기 공급",
        detailed: "비가교 또는 저가교 HA가 진피층에서 수분 끌어당겨 피부 광채 증가",
        keywords: ["HA", "히알루론산", "보습", "물광"]
      },
      
      effects: {
        primary: ["보습", "윤기", "물광 피부"],
        secondary: ["잔주름", "피부결"],
        notFor: ["리프팅", "볼륨", "색소"],
        onsetTime: "즉각~1주",
        duration: "3~6개월"
      },
      
      procedure: {
        duration: "20~30분",
        anesthesia: "마취크림",
        sessions: "2~3회",
        interval: "2~4주",
        method: "미세주사/기계주입"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "따끔",
        downtime: "1~3일",
        commonSideEffects: ["엠보싱", "붓기", "멍"],
        recoveryTips: ["엠보싱 1~2일 내 흡수"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["건조함", "칙칙함", "피부톤", "특별한 날 전"],
        notRecommended: ["활동성 피부염", "HA 알러지"],
        skinType: "모든 피부, 특히 건성"
      },
      
      pros: ["즉각 윤기", "안전함", "간편"],
      cons: ["효과 짧음", "엠보싱 티남", "비용 누적"],
      
      safety: {
        commonSideEffects: ["엠보싱", "멍", "붓기"],
        seriousSideEffects: ["알러지(드묾)", "감염"],
        contraindications: ["HA 알러지", "피부 감염"],
        warnings: ["정품 확인"]
      },
      
      pricing: { range: "10~30만원/회", average: "20만원/회", factors: ["제품", "양"] },
      
      comparison: {
        vs: { "리쥬란": "물광=즉각 보습, 리쥬란=근본 재생" },
        bestWith: ["리쥬란", "리프팅"]
      },
      
      tags: ["물광", "보습", "HA", "윤기", "입문"]
    },

    // ===== 14. 스킨보톡스 =====
    {
      id: "skin-botox",
      name: "스킨보톡스",
      nameEn: "Skin Botox",
      brand: "다양",
      category: "주름/보톡스",
      subcategory: "보톡스",
      
      mechanism: {
        simple: "보톡스를 피부 얕게 주입해 모공과 피지 개선",
        detailed: "희석된 보툴리눔톡신이 피지선과 입모근에 작용, 모공 축소 및 번들거림 감소",
        keywords: ["보톡스", "모공", "피지", "광채"]
      },
      
      effects: {
        primary: ["모공 축소", "피지 조절", "피부결"],
        secondary: ["잔주름", "윤기"],
        notFor: ["리프팅", "볼륨", "색소"],
        onsetTime: "1~2주",
        duration: "3~4개월"
      },
      
      procedure: {
        duration: "15~20분",
        anesthesia: "마취크림",
        sessions: "1회",
        interval: "3~4개월",
        method: "미세주사"
      },
      
      recovery: {
        painLevel: 1.5,
        painDescription: "따끔",
        downtime: "없음~1일",
        commonSideEffects: ["주사자국", "미세 붓기"],
        recoveryTips: ["당일 세안 가능"]
      },
      
      suitability: {
        idealAge: "20대~40대",
        bestFor: ["넓은 모공", "지성 피부", "번들거림", "피부결 개선"],
        notRecommended: ["건성 피부", "보툴리눔 알러지"],
        skinType: "지성/복합성에 특히 효과"
      },
      
      pros: ["모공에 효과적", "다운타임 없음", "간편"],
      cons: ["효과 짧음", "반복 필요"],
      
      safety: {
        commonSideEffects: ["주사자국"],
        seriousSideEffects: ["과도한 건조"],
        contraindications: ["보툴리눔 알러지", "임산부"],
        warnings: ["적정 농도 중요"]
      },
      
      pricing: { range: "10~25만원/회", average: "15만원/회", factors: ["부위", "양"] },
      
      comparison: {
        vs: { "일반 보톡스": "스킨보톡스=모공/피지, 일반=주름/윤곽" },
        bestWith: ["물광주사", "리쥬란"]
      },
      
      tags: ["모공", "피지", "보톡스", "피부결", "지성피부"]
    },

    // ===== 15. 엑소좀 =====
    {
      id: "exosome",
      name: "엑소좀",
      nameEn: "Exosome",
      brand: "ExoCoBio(ASCE+) 등",
      category: "스킨부스터",
      subcategory: "엑소좀",
      
      mechanism: {
        simple: "줄기세포 유래 엑소좀으로 피부 재생 촉진",
        detailed: "줄기세포에서 분비된 나노 소포체가 성장인자/단백질 전달, 세포 커뮤니케이션 활성화",
        keywords: ["엑소좀", "줄기세포", "재생", "성장인자"]
      },
      
      effects: {
        primary: ["피부 재생", "항염", "트러블 진정"],
        secondary: ["탄력", "피부결", "홍반"],
        notFor: ["리프팅", "볼륨", "색소 직접 치료"],
        onsetTime: "2~4주",
        duration: "3~6개월"
      },
      
      procedure: {
        duration: "20~30분",
        anesthesia: "마취크림",
        sessions: "3~5회",
        interval: "2~4주",
        method: "미세주사/MTS"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "따끔",
        downtime: "1~2일",
        commonSideEffects: ["홍반", "붓기"],
        recoveryTips: ["보습", "자극 피하기"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["민감성", "트러블 피부", "시술 후 재생", "전반적 피부개선"],
        notRecommended: ["자가면역질환", "악성종양 병력"],
        skinType: "모든 피부, 특히 민감성/트러블"
      },
      
      pros: ["강력한 재생", "민감성에도 가능", "트러블 진정", "다른 시술 후 회복"],
      cons: ["비용", "여러 회 필요", "효과 개인차"],
      
      safety: {
        commonSideEffects: ["홍반", "붓기"],
        seriousSideEffects: ["알러지(매우 드묾)"],
        contraindications: ["악성종양", "자가면역질환"],
        warnings: ["제품 품질 확인"]
      },
      
      pricing: { range: "20~50만원/회", average: "30만원/회", factors: ["제품", "농도"] },
      
      comparison: {
        vs: { "리쥬란": "엑소좀=재생/항염 더 강력, 리쥬란=탄력" },
        bestWith: ["MRF", "리프팅", "레이저 후"]
      },
      
      tags: ["엑소좀", "재생", "줄기세포", "민감성", "트러블"]
    },

    // ===== 16. 제모 레이저 =====
    {
      id: "hair-removal",
      name: "레이저 제모",
      nameEn: "Laser Hair Removal",
      brand: "젠틀맥스, 클라리티 등",
      category: "제모",
      subcategory: "레이저",
      
      mechanism: {
        simple: "레이저가 모낭의 멜라닌 흡수해 영구적으로 털 감소",
        detailed: "755nm/1064nm 레이저가 모낭에 흡수되어 열 발생, 성장기 모낭 파괴",
        keywords: ["레이저제모", "모낭", "영구제모", "755nm"]
      },
      
      effects: {
        primary: ["영구적 털 감소", "모낭 파괴"],
        secondary: ["피부결 개선", "모공 축소"],
        notFor: ["흰털", "금색 털"],
        onsetTime: "2~3회 후 감소 느낌",
        duration: "영구적(80~90% 감모)"
      },
      
      procedure: {
        duration: "부위별 10~60분",
        anesthesia: "대부분 불필요",
        sessions: "6~10회",
        interval: "4~6주(얼굴), 6~8주(바디)",
        method: "레이저"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "고무줄로 튕기는 느낌",
        downtime: "없음",
        commonSideEffects: ["홍반", "열감"],
        recoveryTips: ["자외선 차단", "보습"]
      },
      
      suitability: {
        idealAge: "10대 후반~50대",
        bestFor: ["짙은 털", "면도 귀찮음", "매끄러운 피부 원함"],
        notRecommended: ["흰털/금털", "피부질환", "일광화상 직후"],
        skinType: "모든 피부톤(장비 선택)"
      },
      
      pros: ["영구적 효과", "시간 절약", "매끄러움", "모공 개선"],
      cons: ["여러 회 필요", "비용", "흰털 불가"],
      
      safety: {
        commonSideEffects: ["홍반", "열감", "일시적 부종"],
        seriousSideEffects: ["화상", "색소침착(드묾)"],
        contraindications: ["광과민증", "활동성 피부질환"],
        warnings: ["시술 전 왁싱/뽑기 금지"]
      },
      
      pricing: { range: "1~20만원/부위/회", average: "5만원/부위/회", factors: ["부위", "횟수"] },
      
      comparison: {
        vs: { "IPL제모": "레이저가 더 효과적이지만 비쌈" },
        bestWith: ["제모 후 스킨케어"]
      },
      
      tags: ["제모", "영구제모", "레이저", "매끄러움"]
    },

    // ===== 17. 실리프팅 =====
    {
      id: "thread-lift",
      name: "실리프팅",
      nameEn: "Thread Lift",
      brand: "PDO, PCL, PLLA 다양",
      category: "리프팅/타이트닝",
      subcategory: "실리프팅",
      
      mechanism: {
        simple: "녹는 실을 피부 아래 삽입해 즉각적으로 당겨 올림",
        detailed: "코그(가시) 달린 실이 조직을 물리적으로 거상, 이후 콜라겐 생성 유도",
        keywords: ["실리프팅", "PDO", "코그", "거상"]
      },
      
      effects: {
        primary: ["즉각 리프팅", "턱선", "볼처짐"],
        secondary: ["콜라겐 재생"],
        notFor: ["탄력만 원하는 경우", "볼륨"],
        onsetTime: "즉각 효과",
        duration: "1~2년 (실 종류에 따라)"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "국소마취",
        sessions: "1회",
        interval: "1~2년",
        method: "실 삽입"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "뻐근함, 당김",
        downtime: "3~7일",
        commonSideEffects: ["붓기", "멍", "당김감"],
        recoveryTips: ["입 크게 안벌리기 2주", "격한 표정 자제"]
      },
      
      suitability: {
        idealAge: "30대~50대",
        bestFor: ["즉각 효과 원하는 분", "중등도 처짐", "수술 안하고 리프팅"],
        notRecommended: ["피부 매우 얇은 분", "켈로이드", "심한 처짐"],
        skinType: "대부분 가능"
      },
      
      pros: ["즉각 효과", "수술 대비 간단", "회복 빠름"],
      cons: ["효과 제한적", "부작용 가능", "비용"],
      
      safety: {
        commonSideEffects: ["붓기", "멍", "당김", "뻐근함"],
        seriousSideEffects: ["실 튀어나옴", "감염", "비대칭"],
        contraindications: ["켈로이드", "자가면역질환", "혈액응고장애"],
        warnings: ["숙련된 시술자 중요"]
      },
      
      pricing: { range: "50~200만원", average: "100만원", factors: ["실 종류", "개수"] },
      
      comparison: {
        vs: { "울쎄라": "실=즉각 물리적 거상, 울쎄라=점진적 콜라겐" },
        bestWith: ["필러", "보톡스"]
      },
      
      tags: ["실리프팅", "즉각효과", "리프팅", "거상"]
    },

    // ===== 18. 여드름 치료 =====
    {
      id: "acne-treatment",
      name: "여드름 치료",
      nameEn: "Acne Treatment",
      brand: "아큐네, PDT 등",
      category: "여드름/트러블",
      subcategory: "복합치료",
      
      mechanism: {
        simple: "레이저/PDT/압출 복합으로 여드름 원인 치료",
        detailed: "PDT(광역동치료)는 피지선 축소, 레이저는 살균/염증 완화, 압출은 즉각 배출",
        keywords: ["여드름", "PDT", "피지", "염증"]
      },
      
      effects: {
        primary: ["여드름 개선", "피지 조절", "염증 완화"],
        secondary: ["모공", "흉터 예방"],
        notFor: ["흉터 치료(별도)", "리프팅"],
        onsetTime: "2~4주 후 개선",
        duration: "유지관리 필요"
      },
      
      procedure: {
        duration: "30~60분",
        anesthesia: "마취크림(PDT시)",
        sessions: "5~10회",
        interval: "1~2주",
        method: "복합치료"
      },
      
      recovery: {
        painLevel: 2,
        painDescription: "얼얼함, 화끈",
        downtime: "1~3일",
        commonSideEffects: ["홍반", "각질", "일시적 악화"],
        recoveryTips: ["자외선 차단", "보습", "손대지 않기"]
      },
      
      suitability: {
        idealAge: "10대~30대",
        bestFor: ["활동성 여드름", "반복되는 트러블", "피지 과다"],
        notRecommended: ["광과민증", "임산부(일부 치료)"],
        skinType: "지성/여드름 피부"
      },
      
      pros: ["근본 원인 치료", "재발 감소", "흉터 예방"],
      cons: ["여러 회 필요", "일시적 악화 가능", "비용 누적"],
      
      safety: {
        commonSideEffects: ["홍반", "각질", "일시적 여드름 악화"],
        seriousSideEffects: ["색소침착", "화상(드묾)"],
        contraindications: ["광과민증", "PDT 과민"],
        warnings: ["짜지 않기", "처방약 병행"]
      },
      
      pricing: { range: "5~20만원/회", average: "10만원/회", factors: ["치료 종류", "정도"] },
      
      comparison: {
        vs: { "스킨케어만": "시술이 더 빠르고 확실한 효과" },
        bestWith: ["스킨케어 처방", "스킨부스터(안정 후)"]
      },
      
      tags: ["여드름", "트러블", "피지", "PDT", "관리"]
    },

    // ===== 19. IPL =====
    {
      id: "ipl",
      name: "IPL",
      nameEn: "Intense Pulsed Light",
      brand: "루메니스, M22 등",
      category: "색소/미백",
      subcategory: "IPL",
      
      mechanism: {
        simple: "여러 파장의 빛으로 색소/홍반/탄력 복합 개선",
        detailed: "광대역 빛이 멜라닌/헤모글로빈에 흡수되어 색소 파괴 및 혈관 응고",
        keywords: ["IPL", "광선치료", "색소", "홍반"]
      },
      
      effects: {
        primary: ["잡티", "홍반", "안면홍조"],
        secondary: ["피부톤", "모세혈관", "탄력"],
        notFor: ["깊은 기미", "리프팅", "볼륨"],
        onsetTime: "1~2주 후(잡티 딱지 탈락)",
        duration: "유지관리 필요"
      },
      
      procedure: {
        duration: "15~30분",
        anesthesia: "불필요~마취크림",
        sessions: "3~5회",
        interval: "3~4주",
        method: "광조사"
      },
      
      recovery: {
        painLevel: 1.5,
        painDescription: "고무줄 튕김",
        downtime: "없음~3일",
        commonSideEffects: ["홍반", "잡티 진해짐(→탈락)", "딱지"],
        recoveryTips: ["자외선 차단 필수", "딱지 뜯지 않기"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["잡티", "홍반/홍조", "피부톤 개선", "모세혈관"],
        notRecommended: ["어두운 피부톤", "일광화상 직후", "광과민증"],
        skinType: "밝은 피부에 효과적"
      },
      
      pros: ["다목적", "다운타임 적음", "통증 적음", "가격 합리적"],
      cons: ["깊은 색소 한계", "여러 회 필요", "일시적 잡티 진해짐"],
      
      safety: {
        commonSideEffects: ["홍반", "딱지", "일시적 색소침착"],
        seriousSideEffects: ["화상", "색소탈실"],
        contraindications: ["광과민증", "최근 태닝"],
        warnings: ["자외선 차단 철저"]
      },
      
      pricing: { range: "8~20만원/회", average: "12만원/회", factors: ["장비", "부위"] },
      
      comparison: {
        vs: { "레이저토닝": "IPL=잡티/홍반에 강함, 토닝=깊은 색소" },
        bestWith: ["스킨부스터", "보습관리"]
      },
      
      tags: ["IPL", "잡티", "홍반", "복합개선", "관리"]
    },

    // ===== 20. 지방분해 주사 =====
    {
      id: "lipolysis-injection",
      name: "지방분해주사",
      nameEn: "Lipolysis Injection",
      brand: "카이벨라, PPC 등",
      category: "바디/지방",
      subcategory: "지방분해",
      
      mechanism: {
        simple: "약물 주입으로 지방세포 파괴해 국소 지방 감소",
        detailed: "디옥시콜산(카이벨라) 또는 PPC가 지방세포막 용해, 대사 배출",
        keywords: ["지방분해", "카이벨라", "이중턱", "윤곽"]
      },
      
      effects: {
        primary: ["이중턱 감소", "턱선 개선", "국소 지방 감소"],
        secondary: ["윤곽 개선"],
        notFor: ["전신 다이어트", "탄력(별도 시술)"],
        onsetTime: "4~6주 후 효과",
        duration: "영구적(지방세포 파괴)"
      },
      
      procedure: {
        duration: "15~30분",
        anesthesia: "마취크림/얼음찜질",
        sessions: "2~4회",
        interval: "4~6주",
        method: "주사"
      },
      
      recovery: {
        painLevel: 2.5,
        painDescription: "화끈거림, 붓기",
        downtime: "3~7일",
        commonSideEffects: ["붓기(심함)", "멍", "뭉침", "저림"],
        recoveryTips: ["냉찜질", "2~3일 심한 붓기 정상"]
      },
      
      suitability: {
        idealAge: "20대~50대",
        bestFor: ["이중턱", "볼살", "국소 지방", "운동해도 안빠지는 곳"],
        notRecommended: ["삼킴곤란", "시술부위 감염", "임산부"],
        skinType: "무관"
      },
      
      pros: ["수술 없이 지방 감소", "영구적 효과", "국소 타겟"],
      cons: ["붓기 심함", "통증", "여러 회 필요", "비용"],
      
      safety: {
        commonSideEffects: ["붓기", "멍", "통증", "저림", "뭉침"],
        seriousSideEffects: ["신경손상(일시적)", "피부괴사(매우 드묾)"],
        contraindications: ["삼킴곤란", "감염", "응고장애"],
        warnings: ["FDA 승인 제품(카이벨라) 권장"]
      },
      
      pricing: { range: "20~50만원/회", average: "35만원/회", factors: ["부위", "양"] },
      
      comparison: {
        vs: { "쿨스컬프팅": "주사=더 빠름/붓기 많음, 쿨스컬프팅=무통증/느림" },
        bestWith: ["리프팅(탄력 보완)", "인모드"]
      },
      
      tags: ["지방분해", "이중턱", "윤곽", "카이벨라", "국소지방"]
    },

    // ===== 21. 더블로 골드 =====
    {
      id: "doublo-gold",
      name: "더블로 골드",
      nameEn: "Doublo Gold",
      brand: "Hironic",
      category: "리프팅/타이트닝",
      subcategory: "HIFU",
      mechanism: {
        simple: "HIFU 초음파로 근막층 자극하는 국산 리프팅 장비",
        detailed: "고강도 집속초음파가 SMAS층에 열응고점 형성, 콜라겐 재생 유도",
        keywords: ["HIFU", "국산", "리프팅", "초음파"]
      },
      effects: {
        primary: ["리프팅", "턱선", "탄력"],
        secondary: ["주름완화", "피부결"],
        notFor: ["볼륨", "색소"],
        onsetTime: "2~4주 후 효과",
        duration: "6개월~1년"
      },
      procedure: { duration: "30~40분", anesthesia: "마취크림", sessions: "2~3회", interval: "2~3개월" },
      recovery: { painLevel: 2.5, painDescription: "찌릿함", downtime: "없음", commonSideEffects: ["홍반", "붓기"], recoveryTips: ["당일 일상 가능"] },
      suitability: { idealAge: "30대~50대", bestFor: ["가성비 리프팅", "유지관리"], notRecommended: ["심한 처짐"], skinType: "모든 피부" },
      pros: ["국산 가성비", "다운타임 없음", "통증 적음"],
      cons: ["효과 울쎄라보다 약함", "여러 회 필요"],
      safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["볼패임(드묾)"], contraindications: ["임신", "피부염"], warnings: ["숙련된 시술자"] },
      pricing: { range: "15~40만원/회", average: "25만원/회", factors: ["샷수", "부위"] },
      comparison: { vs: { "울쎄라": "더블로가 저렴, 효과는 울쎄라" }, bestWith: ["스킨부스터"] },
      tags: ["HIFU", "국산", "가성비", "리프팅"]
    },

    // ===== 22. 울트라포머 MPT =====
    {
      id: "ultraformer-mpt",
      name: "울트라포머 MPT",
      nameEn: "Ultraformer MPT",
      brand: "Classys",
      category: "리프팅/타이트닝",
      subcategory: "HIFU",
      mechanism: {
        simple: "펜타입 HIFU로 정밀한 리프팅, 눈가/입가 세밀 시술 가능",
        detailed: "MPT 기술로 미세한 부위까지 초음파 에너지 전달, SMAS층 타겟팅",
        keywords: ["HIFU", "MPT", "펜타입", "정밀"]
      },
      effects: {
        primary: ["눈가리프팅", "입가", "세밀부위"],
        secondary: ["탄력", "잔주름"],
        notFor: ["전체 리프팅", "볼륨"],
        onsetTime: "2~4주",
        duration: "6개월~1년"
      },
      procedure: { duration: "20~40분", anesthesia: "마취크림", sessions: "3~5회", interval: "1개월" },
      recovery: { painLevel: 2, painDescription: "따끔", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["바로 일상"] },
      suitability: { idealAge: "30대~50대", bestFor: ["눈가 주름", "입가", "세밀 부위"], notRecommended: ["전체 처짐"], skinType: "모든 피부" },
      pros: ["세밀 시술 가능", "눈가 특화", "통증 적음"],
      cons: ["넓은 부위 비효율", "여러 회 필요"],
      safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["드묾"], contraindications: ["임신"], warnings: [] },
      pricing: { range: "10~30만원/회", average: "20만원/회", factors: ["부위", "샷수"] },
      comparison: { vs: { "슈링크": "울트라포머=세밀, 슈링크=넓은부위" }, bestWith: ["슈링크", "보톡스"] },
      tags: ["HIFU", "눈가", "세밀", "펜타입"]
    },

    // ===== 23. 소프웨이브 =====
    {
      id: "sofwave",
      name: "소프웨이브",
      nameEn: "Sofwave",
      brand: "Sofwave",
      category: "리프팅/타이트닝",
      subcategory: "HIFU",
      mechanism: {
        simple: "SUPERB 기술로 1.5mm 깊이 타겟, 잔주름 특화 초음파",
        detailed: "12MHz 고주파 초음파로 진피층 중간 깊이 콜라겐 자극",
        keywords: ["SUPERB", "초음파", "주름", "1.5mm"]
      },
      effects: {
        primary: ["잔주름", "피부탄력", "피부결"],
        secondary: ["리프팅(약함)"],
        notFor: ["심한 처짐", "깊은 주름"],
        onsetTime: "1~3개월",
        duration: "6개월~1년"
      },
      procedure: { duration: "30~45분", anesthesia: "마취크림", sessions: "1~2회", interval: "6개월" },
      recovery: { painLevel: 2, painDescription: "따뜻함", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["바로 일상"] },
      suitability: { idealAge: "30대~40대", bestFor: ["초기노화", "잔주름", "탄력저하"], notRecommended: ["심한처짐"], skinType: "모든 피부" },
      pros: ["다운타임 없음", "통증 적음", "FDA승인"],
      cons: ["깊은 리프팅 한계", "비용"],
      safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["드묾"], contraindications: ["임신"], warnings: [] },
      pricing: { range: "50~100만원", average: "70만원", factors: ["부위"] },
      comparison: { vs: { "울쎄라": "소프웨이브=얕은층/주름, 울쎄라=깊은층/리프팅" }, bestWith: ["울쎄라", "스킨부스터"] },
      tags: ["주름", "HIFU", "탄력", "FDA"]
    },

    // ===== 24. 올리지오 =====
    {
      id: "oligio",
      name: "올리지오",
      nameEn: "Oligio",
      brand: "Jeisys",
      category: "리프팅/타이트닝",
      subcategory: "RF",
      mechanism: {
        simple: "국산 RF 리프팅, 써마지 대안으로 탄력과 리프팅 효과",
        detailed: "모노폴라 RF가 진피층에 열 전달, 콜라겐 수축 및 재생",
        keywords: ["RF", "국산", "탄력", "모노폴라"]
      },
      effects: {
        primary: ["탄력", "리프팅", "피부결"],
        secondary: ["모공", "잔주름"],
        notFor: ["볼륨", "색소"],
        onsetTime: "즉각+1~3개월 점진",
        duration: "1년"
      },
      procedure: { duration: "30~60분", anesthesia: "불필요~마취크림", sessions: "1회", interval: "1년" },
      recovery: { painLevel: 2, painDescription: "따뜻~뜨거움", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["바로 일상"] },
      suitability: { idealAge: "30대~50대", bestFor: ["탄력저하", "가성비 RF"], notRecommended: ["페이스메이커"], skinType: "모든 피부" },
      pros: ["국산 가성비", "써마지 대비 저렴", "통증 적음"],
      cons: ["써마지보다 효과 약할 수 있음"],
      safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["화상(드묾)"], contraindications: ["페이스메이커", "임신"], warnings: [] },
      pricing: { range: "40~100만원", average: "60만원", factors: ["팁수", "부위"] },
      comparison: { vs: { "써마지": "올리지오가 저렴, 효과는 써마지" }, bestWith: ["HIFU", "스킨부스터"] },
      tags: ["RF", "국산", "탄력", "가성비"]
    },

    // ===== 25. 모피어스8 =====
    {
      id: "morpheus8",
      name: "모피어스8",
      nameEn: "Morpheus8",
      brand: "InMode",
      category: "흉터/모공",
      subcategory: "MRF",
      mechanism: {
        simple: "마이크로니들+RF로 흉터/모공/탄력 복합 개선",
        detailed: "24개 미세바늘이 진피층까지 RF 전달, 콜라겐 리모델링",
        keywords: ["MRF", "니들RF", "흉터", "탄력"]
      },
      effects: {
        primary: ["흉터", "모공", "탄력"],
        secondary: ["잔주름", "피부결"],
        notFor: ["리프팅", "색소"],
        onsetTime: "4~6주",
        duration: "1~2년"
      },
      procedure: { duration: "30~60분", anesthesia: "마취크림 필수", sessions: "3~4회", interval: "4~6주" },
      recovery: { painLevel: 3, painDescription: "따끔~화끈", downtime: "3~7일", commonSideEffects: ["홍반", "붓기", "각질"], recoveryTips: ["보습", "자외선 차단"] },
      suitability: { idealAge: "20대~50대", bestFor: ["여드름흉터", "모공", "탄력저하"], notRecommended: ["켈로이드", "활동성여드름"], skinType: "모든 피부톤" },
      pros: ["흉터+탄력 동시", "깊은 진피 타겟", "모든 피부톤"],
      cons: ["다운타임", "통증", "비용"],
      safety: { commonSideEffects: ["홍반", "붓기"], seriousSideEffects: ["감염", "색소침착"], contraindications: ["켈로이드", "혈액응고장애"], warnings: ["위생 중요"] },
      pricing: { range: "40~80만원/회", average: "50만원/회", factors: ["부위", "팁"] },
      comparison: { vs: { "스카펫": "비슷한 MRF, 병원따라 선호" }, bestWith: ["엑소좀", "스킨부스터"] },
      tags: ["MRF", "흉터", "모공", "탄력"]
    },

    // ===== 26. 시크릿RF =====
    {
      id: "secret-rf",
      name: "시크릿 RF",
      nameEn: "Secret RF",
      brand: "Cutera",
      category: "흉터/모공",
      subcategory: "MRF",
      mechanism: {
        simple: "마이크로니들+RF로 흉터/모공/탄력 개선",
        detailed: "64개 니들이 RF 전달, 콜라겐 재생 유도",
        keywords: ["MRF", "니들RF", "흉터", "64핀"]
      },
      effects: {
        primary: ["흉터", "모공", "탄력"],
        secondary: ["주름", "피부결"],
        notFor: ["리프팅", "색소"],
        onsetTime: "4~6주",
        duration: "1~2년"
      },
      procedure: { duration: "30~45분", anesthesia: "마취크림", sessions: "3~5회", interval: "4주" },
      recovery: { painLevel: 2.5, painDescription: "따끔", downtime: "2~5일", commonSideEffects: ["홍반", "붓기"], recoveryTips: ["보습", "자외선차단"] },
      suitability: { idealAge: "20대~50대", bestFor: ["여드름흉터", "모공"], notRecommended: ["켈로이드"], skinType: "모든 피부" },
      pros: ["흉터 효과", "탄력 개선"],
      cons: ["다운타임", "여러 회 필요"],
      safety: { commonSideEffects: ["홍반", "붓기"], seriousSideEffects: ["감염"], contraindications: ["켈로이드", "피부감염"], warnings: [] },
      pricing: { range: "30~60만원/회", average: "40만원/회", factors: ["부위"] },
      comparison: { vs: { "모피어스8": "비슷, 병원 보유장비따라" }, bestWith: ["스킨부스터"] },
      tags: ["MRF", "흉터", "모공"]
    },

    // ===== 27. 실펌X =====
    {
      id: "sylfirm-x",
      name: "실펌X",
      nameEn: "Sylfirm X",
      brand: "Sillex",
      category: "흉터/모공",
      subcategory: "MRF",
      mechanism: {
        simple: "펄스+연속파 듀얼RF로 기미/홍조에도 효과",
        detailed: "RP(반복펄스)모드가 색소/혈관에 선택적 작용, CW모드는 탄력",
        keywords: ["MRF", "기미", "홍조", "듀얼RF"]
      },
      effects: {
        primary: ["기미", "홍조", "모공"],
        secondary: ["흉터", "탄력"],
        notFor: ["리프팅"],
        onsetTime: "4~6주",
        duration: "유지관리"
      },
      procedure: { duration: "30~45분", anesthesia: "마취크림", sessions: "4~6회", interval: "2~4주" },
      recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["홍반"], recoveryTips: ["자외선 차단"] },
      suitability: { idealAge: "30대~50대", bestFor: ["기미", "홍조", "모공"], notRecommended: ["광과민증"], skinType: "모든 피부" },
      pros: ["기미/홍조에도 효과", "다운타임 적음"],
      cons: ["여러 회 필요", "유지관리"],
      safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착(드묾)"], contraindications: ["광과민증"], warnings: ["자외선 차단"] },
      pricing: { range: "20~50만원/회", average: "35만원/회", factors: ["부위", "모드"] },
      comparison: { vs: { "모피어스8": "실펌=기미/홍조 특화" }, bestWith: ["토닝", "스킨부스터"] },
      tags: ["MRF", "기미", "홍조", "모공"]
    },

    // ===== 28. 아그네스 =====
    {
      id: "agnes",
      name: "아그네스",
      nameEn: "Agnes",
      brand: "Gowoonsesang",
      category: "여드름/트러블",
      subcategory: "RF",
      mechanism: {
        simple: "극세침 RF로 피지선 직접 파괴, 여드름 근본 치료",
        detailed: "절연침이 피지선에 RF 전달하여 선택적 파괴, 재발 방지",
        keywords: ["여드름", "피지선", "RF", "절연침"]
      },
      effects: {
        primary: ["여드름", "피지선파괴", "재발방지"],
        secondary: ["모공"],
        notFor: ["흉터", "탄력"],
        onsetTime: "2~4주",
        duration: "반영구적"
      },
      procedure: { duration: "30~60분", anesthesia: "마취크림", sessions: "2~4회", interval: "4주" },
      recovery: { painLevel: 2.5, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["붓기", "딱지"], recoveryTips: ["딱지 자연탈락"] },
      suitability: { idealAge: "10대~40대", bestFor: ["반복여드름", "피지과다"], notRecommended: ["활동성 염증심함"], skinType: "모든 피부" },
      pros: ["근본적 치료", "재발 감소"],
      cons: ["여러 회 필요", "비용"],
      safety: { commonSideEffects: ["붓기", "딱지"], seriousSideEffects: ["색소침착(드묾)"], contraindications: ["켈로이드"], warnings: [] },
      pricing: { range: "20~40만원/회", average: "30만원/회", factors: ["부위", "범위"] },
      comparison: { vs: { "PDT": "아그네스=피지선파괴, PDT=살균" }, bestWith: ["스킨케어", "PDT"] },
      tags: ["여드름", "피지", "RF", "근본치료"]
    },

    // ===== 29. PDO 코그실 =====
    {
      id: "pdo-cog",
      name: "PDO 코그실",
      nameEn: "PDO Cog Thread",
      brand: "다양",
      category: "리프팅/타이트닝",
      subcategory: "실리프팅",
      mechanism: {
        simple: "가시달린 녹는 실로 즉각적 리프팅",
        detailed: "코그(가시)가 조직을 물리적으로 거상하고 PDO가 콜라겐 생성 유도",
        keywords: ["실리프팅", "PDO", "코그", "거상"]
      },
      effects: {
        primary: ["즉각리프팅", "턱선", "볼처짐"],
        secondary: ["콜라겐재생"],
        notFor: ["탄력만", "볼륨"],
        onsetTime: "즉각",
        duration: "1~1.5년"
      },
      procedure: { duration: "30~60분", anesthesia: "국소마취", sessions: "1회", interval: "1~2년" },
      recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기", "멍", "당김"], recoveryTips: ["큰 표정 자제 2주"] },
      suitability: { idealAge: "30대~50대", bestFor: ["즉각효과", "중등도처짐"], notRecommended: ["켈로이드", "심한처짐"], skinType: "대부분" },
      pros: ["즉각 효과", "회복 빠름"],
      cons: ["효과 제한적", "부작용 가능"],
      safety: { commonSideEffects: ["붓기", "멍"], seriousSideEffects: ["실튀어나옴", "감염"], contraindications: ["켈로이드", "응고장애"], warnings: ["숙련자에게"] },
      pricing: { range: "50~150만원", average: "80만원", factors: ["실 종류", "개수"] },
      comparison: { vs: { "울쎄라": "실=즉각거상, 울쎄라=점진콜라겐" }, bestWith: ["필러", "보톡스"] },
      tags: ["실리프팅", "PDO", "즉각효과", "리프팅"]
    },

    // ===== 30. 민트리프트 =====
    {
      id: "mint-lift",
      name: "민트리프트",
      nameEn: "Mint Lift",
      brand: "HansBiomed",
      category: "리프팅/타이트닝",
      subcategory: "실리프팅",
      mechanism: {
        simple: "PDO+PCL 복합실로 지속력 강화",
        detailed: "PDO와 PCL 혼합으로 콜라겐 재생 기간 연장",
        keywords: ["실리프팅", "PDO", "PCL", "복합"]
      },
      effects: {
        primary: ["리프팅", "턱선", "탄력"],
        secondary: ["콜라겐재생"],
        notFor: ["볼륨"],
        onsetTime: "즉각",
        duration: "1.5~2년"
      },
      procedure: { duration: "30~60분", anesthesia: "국소마취", sessions: "1회", interval: "1.5~2년" },
      recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "5~7일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["큰 표정 자제"] },
      suitability: { idealAge: "30대~50대", bestFor: ["오래가는 실리프팅"], notRecommended: ["켈로이드"], skinType: "대부분" },
      pros: ["PDO보다 오래감", "자연스러움"],
      cons: ["비용", "부작용 가능"],
      safety: { commonSideEffects: ["붓기", "멍"], seriousSideEffects: ["감염", "실이동"], contraindications: ["켈로이드"], warnings: [] },
      pricing: { range: "80~200만원", average: "120만원", factors: ["실 개수"] },
      comparison: { vs: { "PDO실": "민트가 더 오래감" }, bestWith: ["필러"] },
      tags: ["실리프팅", "민트", "PDO", "PCL"]
    },

    // ===== 31~90: 추가 시술들 =====
    { id: "emface", name: "엠페이스", nameEn: "Emface", brand: "BTL", category: "리프팅/타이트닝", subcategory: "EMS", mechanism: { simple: "HIFES+RF로 표정근 강화", detailed: "전기자극+RF로 근육강화 및 콜라겐", keywords: ["EMS", "근육"] }, effects: { primary: ["탄력", "리프팅"], secondary: ["주름"], notFor: ["볼륨"], onsetTime: "4~6주", duration: "6개월~1년" }, procedure: { duration: "20분", anesthesia: "불필요", sessions: "4회", interval: "주1회" }, recovery: { painLevel: 1, painDescription: "근육움찔", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["바로일상"] }, suitability: { idealAge: "30대~50대", bestFor: ["탄력저하"], notRecommended: ["페이스메이커"], skinType: "모든피부" }, pros: ["무통증", "다운타임없음"], cons: ["효과제한적"], safety: { commonSideEffects: ["근육피로"], seriousSideEffects: ["드묾"], contraindications: ["페이스메이커"], warnings: [] }, pricing: { range: "30~60만원/회", average: "40만원/회", factors: ["부위"] }, comparison: { vs: { "써마지": "엠페이스=근육" }, bestWith: ["스킨부스터"] }, tags: ["EMS", "근육", "무통증"] },

    { id: "titan-lift", name: "티타늄리프팅", nameEn: "Titan Lifting", brand: "Cutera", category: "리프팅/타이트닝", subcategory: "레이저", mechanism: { simple: "3파장 레이저 즉각 리프팅", detailed: "755+810+1064nm 복합파장", keywords: ["레이저", "즉각"] }, effects: { primary: ["즉각리프팅", "톤업"], secondary: ["모공"], notFor: ["볼륨"], onsetTime: "즉각", duration: "3~6개월" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "3~5회", interval: "2~4주" }, recovery: { painLevel: 2, painDescription: "따뜻함", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["바로일상"] }, suitability: { idealAge: "20대~50대", bestFor: ["즉각효과", "행사전"], notRecommended: ["광과민증"], skinType: "모든피부" }, pros: ["즉각효과", "다운타임없음"], cons: ["효과짧음"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["화상(드묾)"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "20~50만원/회", average: "30만원/회", factors: ["부위"] }, comparison: { vs: { "슈링크": "티타늄=즉각" }, bestWith: ["슈링크"] }, tags: ["레이저", "즉각", "톤업"] },

    { id: "sculptra", name: "스컬트라", nameEn: "Sculptra", brand: "Galderma", category: "필러/볼륨", subcategory: "콜라겐부스터", mechanism: { simple: "PLLA로 콜라겐 생성 유도", detailed: "폴리락틱산 콜라겐 합성 자극", keywords: ["PLLA", "콜라겐"] }, effects: { primary: ["볼륨", "탄력"], secondary: ["윤곽"], notFor: ["즉각볼륨"], onsetTime: "1~3개월", duration: "2년이상" }, procedure: { duration: "30~60분", anesthesia: "마취크림", sessions: "2~3회", interval: "4~6주" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "1~5일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["마사지5일"] }, suitability: { idealAge: "30대~60대", bestFor: ["볼륨감소", "팔자"], notRecommended: ["결절이력"], skinType: "무관" }, pros: ["오래지속", "자연스러움"], cons: ["효과느림", "결절가능"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["결절"], contraindications: ["켈로이드"], warnings: ["마사지필수"] }, pricing: { range: "50~80만원/바이알", average: "60만원", factors: ["바이알수"] }, comparison: { vs: { "HA필러": "스컬트라=오래감" }, bestWith: ["HA필러"] }, tags: ["콜라겐부스터", "PLLA", "볼륨"] },

    { id: "ellanse", name: "엘란쎄", nameEn: "Ellanse", brand: "Sinclair", category: "필러/볼륨", subcategory: "콜라겐부스터", mechanism: { simple: "PCL+CMC젤 즉각+점진 효과", detailed: "즉각볼륨+콜라겐유도", keywords: ["PCL", "콜라겐"] }, effects: { primary: ["즉각볼륨", "콜라겐"], secondary: ["탄력"], notFor: ["입술"], onsetTime: "즉각+점진", duration: "1~4년" }, procedure: { duration: "30~60분", anesthesia: "마취크림", sessions: "1회", interval: "1~4년" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기"], recoveryTips: ["마사지금지"] }, suitability: { idealAge: "30대~50대", bestFor: ["볼륨+콜라겐"], notRecommended: ["녹여야할경우"], skinType: "무관" }, pros: ["즉각+점진", "오래감"], cons: ["녹일수없음"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["결절"], contraindications: ["자가면역"], warnings: ["신중히"] }, pricing: { range: "40~80만원/cc", average: "60만원", factors: ["등급"] }, comparison: { vs: { "스컬트라": "엘란쎄=즉각도있음" }, bestWith: ["보톡스"] }, tags: ["콜라겐부스터", "PCL"] },

    { id: "profhilo", name: "프로파일로", nameEn: "Profhilo", brand: "IBSA", category: "스킨부스터", subcategory: "HA", mechanism: { simple: "고순도HA BAP포인트 주입", detailed: "진피전체 탄력리모델링", keywords: ["HA", "BAP"] }, effects: { primary: ["탄력", "처짐개선"], secondary: ["보습"], notFor: ["볼륨"], onsetTime: "2~4주", duration: "6개월~1년" }, procedure: { duration: "15~20분", anesthesia: "없음", sessions: "2회", interval: "4주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~2일", commonSideEffects: ["붓기"], recoveryTips: ["마사지금지"] }, suitability: { idealAge: "30대~50대", bestFor: ["전체탄력"], notRecommended: ["HA알러지"], skinType: "모든피부" }, pros: ["전체탄력", "2회완료"], cons: ["볼륨없음"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["알러지"], contraindications: ["HA알러지"], warnings: [] }, pricing: { range: "30~60만원/회", average: "45만원", factors: ["부위"] }, comparison: { vs: { "물광": "프로파일로=탄력" }, bestWith: ["리프팅"] }, tags: ["HA", "탄력", "리모델링"] },

    { id: "filorga", name: "샤넬주사", nameEn: "Filorga NCTF", brand: "Filorga", category: "스킨부스터", subcategory: "HA", mechanism: { simple: "HA+비타민+아미노산 복합", detailed: "50가지성분 영양공급", keywords: ["영양", "비타민"] }, effects: { primary: ["영양", "윤기"], secondary: ["탄력"], notFor: ["볼륨"], onsetTime: "1~2주", duration: "2~4개월" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "3~5회", interval: "2~3주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~2일", commonSideEffects: ["엠보싱"], recoveryTips: ["다음날화장"] }, suitability: { idealAge: "20대~50대", bestFor: ["칙칙함", "피로피부"], notRecommended: ["알러지"], skinType: "모든피부" }, pros: ["영양공급", "윤기"], cons: ["효과짧음"], safety: { commonSideEffects: ["엠보싱"], seriousSideEffects: ["알러지"], contraindications: ["성분알러지"], warnings: [] }, pricing: { range: "15~30만원/회", average: "20만원", factors: ["용량"] }, comparison: { vs: { "리쥬란": "샤넬=영양" }, bestWith: ["토닝"] }, tags: ["영양", "윤기", "샤넬"] },

    { id: "glutathione", name: "백옥주사", nameEn: "Glutathione IV", brand: "다양", category: "주사/수액", subcategory: "미백", mechanism: { simple: "글루타치온 정맥주사 미백", detailed: "항산화+멜라닌억제", keywords: ["글루타치온", "미백"] }, effects: { primary: ["미백", "항산화"], secondary: ["피로회복"], notFor: ["국소색소"], onsetTime: "10~20회후", duration: "유지필요" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 1, painDescription: "주사통증", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["바로일상"] }, suitability: { idealAge: "20대~50대", bestFor: ["전신미백"], notRecommended: ["G6PD결핍"], skinType: "모든피부" }, pros: ["전신효과"], cons: ["여러회필요"], safety: { commonSideEffects: ["드묾"], seriousSideEffects: ["G6PD위험"], contraindications: ["G6PD결핍"], warnings: ["병력확인"] }, pricing: { range: "3~10만원/회", average: "5만원", factors: ["용량"] }, comparison: { vs: { "토닝": "백옥=전신" }, bestWith: ["토닝"] }, tags: ["미백", "글루타치온"] },

    { id: "cinderella", name: "신데렐라주사", nameEn: "Alpha Lipoic Acid IV", brand: "다양", category: "주사/수액", subcategory: "미백", mechanism: { simple: "알파리포산 항산화/미백", detailed: "해독+지방대사+미백", keywords: ["알파리포산", "항산화"] }, effects: { primary: ["항산화", "미백"], secondary: ["다이어트"], notFor: ["국소"], onsetTime: "10회이상", duration: "유지필요" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 1, painDescription: "주사통증", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: [] }, suitability: { idealAge: "20대~50대", bestFor: ["피로", "미백"], notRecommended: ["당뇨주의"], skinType: "무관" }, pros: ["다중효과"], cons: ["여러회"], safety: { commonSideEffects: ["드묾"], seriousSideEffects: ["저혈당"], contraindications: ["당뇨주의"], warnings: [] }, pricing: { range: "3~8만원/회", average: "5만원", factors: [] }, comparison: { vs: { "백옥": "비슷" }, bestWith: ["백옥주사"] }, tags: ["항산화", "미백"] },

    { id: "prp", name: "PRP자가혈", nameEn: "PRP", brand: "자가혈", category: "스킨부스터", subcategory: "재생", mechanism: { simple: "자가혈 성장인자로 재생", detailed: "혈소판풍부혈장 콜라겐촉진", keywords: ["PRP", "재생"] }, effects: { primary: ["재생", "탄력"], secondary: ["흉터"], notFor: ["즉각볼륨"], onsetTime: "2~4주", duration: "3~6개월" }, procedure: { duration: "40~60분", anesthesia: "마취크림", sessions: "3~5회", interval: "2~4주" }, recovery: { painLevel: 2.5, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["자극피하기"] }, suitability: { idealAge: "30대~50대", bestFor: ["재생", "민감성"], notRecommended: ["혈액질환"], skinType: "모든피부" }, pros: ["자가혈안전", "재생효과"], cons: ["채혈필요"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["감염"], contraindications: ["혈액질환"], warnings: [] }, pricing: { range: "20~50만원/회", average: "30만원", factors: [] }, comparison: { vs: { "엑소좀": "PRP=자가혈" }, bestWith: ["MRF"] }, tags: ["PRP", "재생"] },

    { id: "picosure", name: "피코슈어", nameEn: "PicoSure", brand: "Cynosure", category: "색소/미백", subcategory: "피코레이저", mechanism: { simple: "755nm 피코레이저 색소치료", detailed: "피코초펄스 멜라닌파쇄", keywords: ["피코", "755nm"] }, effects: { primary: ["기미", "색소"], secondary: ["피부결"], notFor: ["리프팅"], onsetTime: "3~5회후", duration: "유지관리" }, procedure: { duration: "15~30분", anesthesia: "불필요", sessions: "5~10회", interval: "2~4주" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음~1일", commonSideEffects: ["홍반"], recoveryTips: ["자외선차단"] }, suitability: { idealAge: "20대~50대", bestFor: ["기미", "색소"], notRecommended: ["광과민증"], skinType: "모든피부" }, pros: ["색소효과", "다운타임적음"], cons: ["여러회"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착"], contraindications: ["광과민증"], warnings: ["자외선차단"] }, pricing: { range: "8~20만원/회", average: "12만원", factors: ["장비"] }, comparison: { vs: { "토닝": "피코가더효과적" }, bestWith: ["미백주사"] }, tags: ["피코", "기미", "색소"] },

    { id: "vbeam", name: "브이빔", nameEn: "V-Beam Perfecta", brand: "Candela", category: "색소/미백", subcategory: "혈관레이저", mechanism: { simple: "595nm PDL 홍조/혈관 치료", detailed: "펄스다이레이저 헤모글로빈흡수", keywords: ["PDL", "혈관", "595nm"] }, effects: { primary: ["홍조", "혈관"], secondary: ["여드름홍반"], notFor: ["기미"], onsetTime: "1~3회후", duration: "유지관리" }, procedure: { duration: "15~30분", anesthesia: "불필요", sessions: "3~5회", interval: "3~4주" }, recovery: { painLevel: 1.5, painDescription: "고무줄튕김", downtime: "없음~3일", commonSideEffects: ["홍반", "멍"], recoveryTips: ["자외선차단"] }, suitability: { idealAge: "20대~50대", bestFor: ["홍조", "모세혈관"], notRecommended: ["광과민증"], skinType: "밝은피부" }, pros: ["홍조효과"], cons: ["멍가능"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["색소침착"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "10~25만원/회", average: "15만원", factors: ["부위"] }, comparison: { vs: { "IPL": "브이빔=혈관특화" }, bestWith: ["진정관리"] }, tags: ["혈관", "홍조", "PDL"] },

    { id: "excelv", name: "엑셀브이", nameEn: "Excel V", brand: "Cutera", category: "색소/미백", subcategory: "혈관레이저", mechanism: { simple: "532+1064nm 듀얼 혈관+색소", detailed: "듀얼파장 선택적흡수", keywords: ["듀얼", "혈관", "색소"] }, effects: { primary: ["혈관", "색소"], secondary: ["피부톤"], notFor: ["리프팅"], onsetTime: "2~3회후", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "3~5회", interval: "3~4주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["홍반", "딱지"], recoveryTips: ["자외선차단"] }, suitability: { idealAge: "20대~50대", bestFor: ["혈관+색소"], notRecommended: ["광과민증"], skinType: "모든피부" }, pros: ["혈관+색소동시"], cons: ["다운타임"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "15~30만원/회", average: "20만원", factors: [] }, comparison: { vs: { "브이빔": "엑셀브이=듀얼" }, bestWith: ["토닝"] }, tags: ["혈관", "색소", "듀얼"] },

    { id: "co2mole", name: "CO2점제거", nameEn: "CO2 Mole Removal", brand: "다양", category: "점/사마귀", subcategory: "레이저", mechanism: { simple: "CO2레이저 점 기화제거", detailed: "10600nm 물분자흡수 조직기화", keywords: ["CO2", "점제거"] }, effects: { primary: ["점제거"], secondary: [], notFor: ["색소"], onsetTime: "즉각(딱지후)", duration: "영구적" }, procedure: { duration: "10~30분", anesthesia: "국소마취", sessions: "1~2회", interval: "필요시" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "7~14일", commonSideEffects: ["딱지"], recoveryTips: ["딱지뜯지않기"] }, suitability: { idealAge: "전연령", bestFor: ["점", "사마귀"], notRecommended: ["켈로이드"], skinType: "모든피부" }, pros: ["깔끔제거"], cons: ["흉터가능"], safety: { commonSideEffects: ["딱지"], seriousSideEffects: ["흉터"], contraindications: ["켈로이드"], warnings: [] }, pricing: { range: "5천~3만원/개", average: "1만원/개", factors: ["크기"] }, comparison: { vs: {}, bestWith: ["재생연고"] }, tags: ["점제거", "CO2"] },

    { id: "hydrafacial", name: "하이드라페이셜", nameEn: "HydraFacial", brand: "Edge Systems", category: "스킨케어", subcategory: "클렌징", mechanism: { simple: "물+석션 딥클렌징+보습", detailed: "보텍스석션 노폐물제거", keywords: ["딥클렌징", "모공"] }, effects: { primary: ["모공청소", "보습"], secondary: ["톤업"], notFor: ["리프팅"], onsetTime: "즉각", duration: "2~4주" }, procedure: { duration: "30~40분", anesthesia: "불필요", sessions: "정기관리", interval: "2~4주" }, recovery: { painLevel: 0.5, painDescription: "시원함", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["바로화장"] }, suitability: { idealAge: "10대~50대", bestFor: ["모공", "피지"], notRecommended: ["활동성여드름"], skinType: "모든피부" }, pros: ["무통증", "즉각투명"], cons: ["효과짧음"], safety: { commonSideEffects: ["없음"], seriousSideEffects: ["드묾"], contraindications: ["활동성피부염"], warnings: [] }, pricing: { range: "10~25만원/회", average: "15만원", factors: ["단계"] }, comparison: { vs: { "아쿠아필": "유사" }, bestWith: ["토닝"] }, tags: ["클렌징", "모공"] },

    { id: "aquapeel", name: "아쿠아필", nameEn: "AquaPeel", brand: "다양", category: "스킨케어", subcategory: "클렌징", mechanism: { simple: "워터제트+석션 모공클렌징", detailed: "물+공기압 노폐물제거", keywords: ["워터제트", "모공"] }, effects: { primary: ["모공청소"], secondary: ["톤업"], notFor: ["리프팅"], onsetTime: "즉각", duration: "2~4주" }, procedure: { duration: "30~40분", anesthesia: "불필요", sessions: "정기관리", interval: "2~4주" }, recovery: { painLevel: 0.5, painDescription: "시원함", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["바로화장"] }, suitability: { idealAge: "10대~50대", bestFor: ["모공"], notRecommended: ["심한염증"], skinType: "모든피부" }, pros: ["무통증"], cons: ["효과짧음"], safety: { commonSideEffects: ["없음"], seriousSideEffects: ["드묾"], contraindications: ["활동성염증"], warnings: [] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: { "하이드라페이셜": "유사" }, bestWith: ["토닝"] }, tags: ["클렌징", "모공"] },

    { id: "led", name: "LED테라피", nameEn: "LED Therapy", brand: "다양", category: "스킨케어", subcategory: "광선치료", mechanism: { simple: "LED파장별 재생/진정/살균", detailed: "빨강=재생, 파랑=살균", keywords: ["LED", "재생"] }, effects: { primary: ["재생", "진정"], secondary: ["여드름"], notFor: ["리프팅"], onsetTime: "꾸준히", duration: "유지관리" }, procedure: { duration: "15~20분", anesthesia: "불필요", sessions: "정기관리", interval: "주1~3회" }, recovery: { painLevel: 0, painDescription: "없음", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["바로일상"] }, suitability: { idealAge: "전연령", bestFor: ["진정", "재생"], notRecommended: ["광과민증"], skinType: "모든피부" }, pros: ["무통증", "부작용없음"], cons: ["단독효과미미"], safety: { commonSideEffects: ["없음"], seriousSideEffects: ["없음"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "1~5만원/회", average: "3만원", factors: [] }, comparison: { vs: {}, bestWith: ["모든시술후"] }, tags: ["LED", "진정"] },

    { id: "coolsculpting", name: "쿨스컬프팅", nameEn: "CoolSculpting", brand: "Allergan", category: "바디/지방", subcategory: "냉각지방", mechanism: { simple: "냉각으로 지방세포 파괴", detailed: "크라이오리폴리시스 지방사멸", keywords: ["냉각", "지방"] }, effects: { primary: ["지방감소"], secondary: [], notFor: ["체중감량"], onsetTime: "2~3개월", duration: "영구적" }, procedure: { duration: "35~60분/부위", anesthesia: "불필요", sessions: "1~2회", interval: "2~3개월" }, recovery: { painLevel: 1.5, painDescription: "냉감", downtime: "없음", commonSideEffects: ["붓기", "저림"], recoveryTips: ["마사지"] }, suitability: { idealAge: "20대~50대", bestFor: ["국소지방"], notRecommended: ["냉감과민"], skinType: "무관" }, pros: ["비침습", "FDA승인"], cons: ["효과느림"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["지방역설"], contraindications: ["한랭과민"], warnings: [] }, pricing: { range: "40~80만원/부위", average: "50만원", factors: ["부위"] }, comparison: { vs: { "지방분해주사": "쿨스컬프팅=무통증" }, bestWith: ["인모드바디"] }, tags: ["지방", "냉각", "바디"] },

    { id: "emsculpt", name: "엠스컬프", nameEn: "Emsculpt", brand: "BTL", category: "바디/지방", subcategory: "근육강화", mechanism: { simple: "HIFEM 근육수축 근육증가+지방감소", detailed: "전자기장 초극대수축", keywords: ["HIFEM", "근육"] }, effects: { primary: ["근육강화", "지방감소"], secondary: ["힙업"], notFor: ["체중감량"], onsetTime: "2~4주", duration: "6개월~1년" }, procedure: { duration: "30분/부위", anesthesia: "불필요", sessions: "4~6회", interval: "2~3일" }, recovery: { painLevel: 1, painDescription: "근육운동감", downtime: "없음", commonSideEffects: ["근육통"], recoveryTips: ["바로일상"] }, suitability: { idealAge: "20대~50대", bestFor: ["복근", "힙업"], notRecommended: ["페이스메이커"], skinType: "무관" }, pros: ["운동효과", "무통증"], cons: ["유지운동필요"], safety: { commonSideEffects: ["근육통"], seriousSideEffects: ["드묾"], contraindications: ["페이스메이커"], warnings: [] }, pricing: { range: "20~40만원/회", average: "30만원", factors: [] }, comparison: { vs: { "쿨스컬프팅": "엠스컬프=근육" }, bestWith: ["쿨스컬프팅"] }, tags: ["근육", "HIFEM", "바디"] },

    { id: "miradry", name: "미라드라이", nameEn: "miraDry", brand: "miraDry", category: "다한증/액취", subcategory: "마이크로웨이브", mechanism: { simple: "마이크로웨이브 땀샘파괴", detailed: "땀샘/냄새샘 영구파괴", keywords: ["다한증", "땀샘"] }, effects: { primary: ["다한증개선", "액취감소"], secondary: [], notFor: ["손발다한증"], onsetTime: "즉각", duration: "영구적" }, procedure: { duration: "60~90분", anesthesia: "국소마취", sessions: "1~2회", interval: "3개월" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기", "저림"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "10대~50대", bestFor: ["겨드랑이다한증"], notRecommended: ["페이스메이커"], skinType: "무관" }, pros: ["영구적", "수술아님"], cons: ["비용높음"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["신경손상"], contraindications: ["페이스메이커"], warnings: [] }, pricing: { range: "150~250만원", average: "200만원", factors: [] }, comparison: { vs: { "보톡스다한증": "미라드라이=영구" }, bestWith: [] }, tags: ["다한증", "액취", "영구"] },

    { id: "larapeel", name: "라라필", nameEn: "Lara Peel", brand: "다양", category: "필링", subcategory: "화학필링", mechanism: { simple: "락트산+레티놀 각질제거+재생", detailed: "AHA+레티놀 피부재생", keywords: ["필링", "락트산"] }, effects: { primary: ["각질", "피부결"], secondary: ["톤업"], notFor: ["리프팅"], onsetTime: "1~2주", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "4~6회", interval: "2~3주" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "2~5일", commonSideEffects: ["각질", "홍반"], recoveryTips: ["보습", "자외선차단"] }, suitability: { idealAge: "20대~50대", bestFor: ["칙칙함", "각질"], notRecommended: ["민감성"], skinType: "지성" }, pros: ["피부결개선"], cons: ["다운타임"], safety: { commonSideEffects: ["각질"], seriousSideEffects: ["색소침착"], contraindications: ["피부염"], warnings: ["자외선차단"] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: {}, bestWith: ["스킨부스터"] }, tags: ["필링", "각질"] },

    { id: "soprano", name: "소프라노아이스", nameEn: "Soprano Ice", brand: "Alma", category: "제모", subcategory: "레이저", mechanism: { simple: "SHR방식 무통증 레이저제모", detailed: "저출력반복조사 모낭파괴", keywords: ["제모", "SHR"] }, effects: { primary: ["영구제모"], secondary: [], notFor: ["흰털"], onsetTime: "5~6회후", duration: "영구감모" }, procedure: { duration: "부위별", anesthesia: "불필요", sessions: "6~10회", interval: "4~6주" }, recovery: { painLevel: 1, painDescription: "따뜻함", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["자외선차단"] }, suitability: { idealAge: "10대~50대", bestFor: ["통증민감자"], notRecommended: ["흰털"], skinType: "모든피부톤" }, pros: ["무통증", "빠름"], cons: ["여러회"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["드묾"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "부위별", average: "부위별", factors: [] }, comparison: { vs: { "젠틀맥스": "소프라노=무통증" }, bestWith: [] }, tags: ["제모", "무통증"] },

    { id: "gentlemax", name: "젠틀맥스프로", nameEn: "GentleMax Pro", brand: "Candela", category: "제모", subcategory: "레이저", mechanism: { simple: "755+1064nm 듀얼파장 제모", detailed: "알렉산드라이트+야그 듀얼", keywords: ["제모", "듀얼"] }, effects: { primary: ["영구제모"], secondary: [], notFor: ["흰털"], onsetTime: "5~6회후", duration: "영구감모" }, procedure: { duration: "부위별", anesthesia: "쿨링", sessions: "6~10회", interval: "4~6주" }, recovery: { painLevel: 2, painDescription: "고무줄튕김", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["자외선차단"] }, suitability: { idealAge: "10대~50대", bestFor: ["제모"], notRecommended: ["흰털"], skinType: "모든피부톤" }, pros: ["듀얼파장", "효과적"], cons: ["통증"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["화상"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "부위별", average: "부위별", factors: [] }, comparison: { vs: { "소프라노": "젠틀맥스=효과적" }, bestWith: [] }, tags: ["제모", "듀얼"] },

    { id: "nasolabial", name: "팔자필러", nameEn: "Nasolabial Filler", brand: "다양", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "팔자주름에 HA주입", detailed: "볼륨으로 그림자제거", keywords: ["팔자", "필러"] }, effects: { primary: ["팔자주름"], secondary: ["동안"], notFor: ["탄력"], onsetTime: "즉각", duration: "6~12개월" }, procedure: { duration: "15~20분", anesthesia: "마취크림", sessions: "1회", interval: "6~12개월" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "1~3일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "30대~60대", bestFor: ["팔자주름"], notRecommended: ["켈로이드"], skinType: "무관" }, pros: ["즉각효과"], cons: ["유지필요"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["혈관폐색"], contraindications: ["자가면역"], warnings: ["숙련자에게"] }, pricing: { range: "30~60만원", average: "40만원", factors: [] }, comparison: { vs: {}, bestWith: ["보톡스"] }, tags: ["필러", "팔자"] },

    { id: "chin", name: "턱필러", nameEn: "Chin Filler", brand: "다양", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "턱끝에 필러주입 윤곽개선", detailed: "V라인효과", keywords: ["턱", "윤곽"] }, effects: { primary: ["턱라인", "V라인"], secondary: [], notFor: ["탄력"], onsetTime: "즉각", duration: "12~18개월" }, procedure: { duration: "15~20분", anesthesia: "마취크림", sessions: "1회", interval: "1~1.5년" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "1~5일", commonSideEffects: ["붓기"], recoveryTips: ["턱괴지않기"] }, suitability: { idealAge: "20대~50대", bestFor: ["무턱", "V라인"], notRecommended: ["턱긴경우"], skinType: "무관" }, pros: ["즉각윤곽"], cons: ["유지필요"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["이동"], contraindications: ["감염"], warnings: [] }, pricing: { range: "30~60만원", average: "40만원", factors: [] }, comparison: { vs: {}, bestWith: ["광대필러"] }, tags: ["필러", "턱", "윤곽"] },

    { id: "undereye", name: "다크서클필러", nameEn: "Under Eye Filler", brand: "다양", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "눈밑꺼짐에 필러채움", detailed: "음영제거", keywords: ["다크서클", "눈밑"] }, effects: { primary: ["다크서클"], secondary: [], notFor: ["색소형"], onsetTime: "즉각", duration: "6~12개월" }, procedure: { duration: "15~20분", anesthesia: "마취크림", sessions: "1회", interval: "6~12개월" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "20대~50대", bestFor: ["눈밑꺼짐"], notRecommended: ["색소형"], skinType: "무관" }, pros: ["즉각개선"], cons: ["멍가능"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["뭉침"], contraindications: ["눈질환"], warnings: ["경험많은의사"] }, pricing: { range: "30~50만원", average: "40만원", factors: [] }, comparison: { vs: {}, bestWith: ["보톡스"] }, tags: ["필러", "다크서클"] },

    { id: "lip", name: "입술필러", nameEn: "Lip Filler", brand: "다양", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "입술에 HA주입 볼륨업", detailed: "입술볼륨+모양보정", keywords: ["입술", "볼륨"] }, effects: { primary: ["입술볼륨"], secondary: [], notFor: [], onsetTime: "즉각", duration: "6~12개월" }, procedure: { duration: "15~20분", anesthesia: "마취크림", sessions: "1회", interval: "6~12개월" }, recovery: { painLevel: 2.5, painDescription: "예민부위", downtime: "3~7일", commonSideEffects: ["붓기"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "20대~40대", bestFor: ["얇은입술"], notRecommended: ["헤르페스활성"], skinType: "무관" }, pros: ["자연스러움", "녹임가능"], cons: ["붓기"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["뭉침"], contraindications: ["헤르페스"], warnings: [] }, pricing: { range: "20~50만원", average: "30만원", factors: [] }, comparison: { vs: {}, bestWith: [] }, tags: ["필러", "입술"] },

    { id: "forehead-botox", name: "이마보톡스", nameEn: "Forehead Botox", brand: "다양", category: "주름/보톡스", subcategory: "보톡스", mechanism: { simple: "이마근육에 보톡스 주름완화", detailed: "전두근이완 가로주름개선", keywords: ["이마", "주름"] }, effects: { primary: ["이마주름"], secondary: [], notFor: ["볼륨"], onsetTime: "3~7일", duration: "3~6개월" }, procedure: { duration: "10분", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: ["4시간눕지않기"] }, suitability: { idealAge: "20대~60대", bestFor: ["이마주름"], notRecommended: ["눈썹처짐"], skinType: "무관" }, pros: ["빠른효과"], cons: ["눈썹처짐가능"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["눈썹처짐"], contraindications: ["신경근육질환"], warnings: ["적정용량"] }, pricing: { range: "5~15만원", average: "10만원", factors: [] }, comparison: { vs: {}, bestWith: ["눈가보톡스"] }, tags: ["보톡스", "이마"] },

    { id: "glabella-botox", name: "미간보톡스", nameEn: "Glabella Botox", brand: "다양", category: "주름/보톡스", subcategory: "보톡스", mechanism: { simple: "미간 11자주름 개선", detailed: "추미근이완", keywords: ["미간", "11자"] }, effects: { primary: ["미간주름"], secondary: [], notFor: ["볼륨"], onsetTime: "3~7일", duration: "3~6개월" }, procedure: { duration: "5분", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: ["눕지않기"] }, suitability: { idealAge: "20대~60대", bestFor: ["11자주름"], notRecommended: [], skinType: "무관" }, pros: ["인상개선"], cons: ["반복필요"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["드묾"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "3~10만원", average: "5만원", factors: [] }, comparison: { vs: {}, bestWith: ["이마보톡스"] }, tags: ["보톡스", "미간"] },

    { id: "crowfeet-botox", name: "눈가보톡스", nameEn: "Crow's Feet Botox", brand: "다양", category: "주름/보톡스", subcategory: "보톡스", mechanism: { simple: "눈가주름 완화", detailed: "안륜근이완 까치발개선", keywords: ["눈가", "주름"] }, effects: { primary: ["눈가주름"], secondary: [], notFor: ["눈밑꺼짐"], onsetTime: "3~7일", duration: "3~6개월" }, procedure: { duration: "5~10분", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: [] }, suitability: { idealAge: "20대~60대", bestFor: ["웃을때주름"], notRecommended: [], skinType: "무관" }, pros: ["자연스러움"], cons: ["반복필요"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["드묾"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "5~15만원", average: "8만원", factors: [] }, comparison: { vs: {}, bestWith: ["이마보톡스"] }, tags: ["보톡스", "눈가"] },

    { id: "masseter-botox", name: "사각턱보톡스", nameEn: "Masseter Botox", brand: "다양", category: "주름/보톡스", subcategory: "보톡스", mechanism: { simple: "교근에 보톡스 사각턱축소", detailed: "저작근위축 V라인", keywords: ["사각턱", "윤곽"] }, effects: { primary: ["사각턱축소"], secondary: ["이갈이"], notFor: ["뼈형사각턱"], onsetTime: "2~4주", duration: "4~6개월" }, procedure: { duration: "10분", anesthesia: "불필요", sessions: "1회", interval: "4~6개월" }, recovery: { painLevel: 1.5, painDescription: "뻐근함", downtime: "없음", commonSideEffects: ["뻐근함"], recoveryTips: ["딱딱한음식피하기"] }, suitability: { idealAge: "20대~50대", bestFor: ["근육형사각턱"], notRecommended: ["뼈형"], skinType: "무관" }, pros: ["비수술윤곽"], cons: ["반복필요"], safety: { commonSideEffects: ["뻐근함"], seriousSideEffects: ["비대칭"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "10~30만원", average: "15만원", factors: [] }, comparison: { vs: {}, bestWith: ["턱필러"] }, tags: ["보톡스", "사각턱", "윤곽"] },

    { id: "trapezius-botox", name: "승모근보톡스", nameEn: "Trapezius Botox", brand: "다양", category: "주름/보톡스", subcategory: "보톡스", mechanism: { simple: "승모근에 보톡스 어깨라인개선", detailed: "승모근위축 목길어보임", keywords: ["승모근", "어깨"] }, effects: { primary: ["어깨라인"], secondary: ["통증완화"], notFor: ["뼈구조"], onsetTime: "2~4주", duration: "4~6개월" }, procedure: { duration: "15~20분", anesthesia: "불필요", sessions: "1회", interval: "4~6개월" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "없음", commonSideEffects: ["뻐근함"], recoveryTips: ["무거운것피하기"] }, suitability: { idealAge: "20대~40대", bestFor: ["뭉친승모근"], notRecommended: ["어깨약한분"], skinType: "무관" }, pros: ["드레스라인"], cons: ["대량주입필요"], safety: { commonSideEffects: ["뻐근함"], seriousSideEffects: ["팔힘약화"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "30~60만원", average: "40만원", factors: [] }, comparison: { vs: {}, bestWith: [] }, tags: ["보톡스", "승모근"] },

    { id: "nabotas", name: "나보타", nameEn: "Nabota", brand: "대웅제약", category: "주름/보톡스", subcategory: "보톡스브랜드", mechanism: { simple: "국산 FDA승인 보톡스", detailed: "고순도보툴리눔톡신", keywords: ["보톡스", "국산", "FDA"] }, effects: { primary: ["주름", "윤곽"], secondary: [], notFor: [], onsetTime: "3~7일", duration: "3~6개월" }, procedure: { duration: "부위별", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: [] }, suitability: { idealAge: "전연령", bestFor: ["보톡스시술"], notRecommended: ["보툴리눔알러지"], skinType: "무관" }, pros: ["FDA승인국산", "가성비"], cons: [], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["드묾"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "부위별", average: "부위별", factors: [] }, comparison: { vs: { "보톡스": "나보타=국산" }, bestWith: [] }, tags: ["보톡스", "나보타", "국산"] },

    { id: "dysport", name: "디스포트", nameEn: "Dysport", brand: "Ipsen", category: "주름/보톡스", subcategory: "보톡스브랜드", mechanism: { simple: "영국산 보톡스 퍼짐성좋음", detailed: "넓은부위효과적", keywords: ["보톡스", "퍼짐"] }, effects: { primary: ["주름", "넓은범위"], secondary: [], notFor: [], onsetTime: "2~5일", duration: "3~6개월" }, procedure: { duration: "부위별", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: [] }, suitability: { idealAge: "전연령", bestFor: ["이마", "승모근"], notRecommended: ["섬세부위"], skinType: "무관" }, pros: ["빠른효과", "넓은범위"], cons: ["퍼짐주의"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["드묾"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "부위별", average: "부위별", factors: [] }, comparison: { vs: { "보톡스": "디스포트=퍼짐좋음" }, bestWith: [] }, tags: ["보톡스", "디스포트"] },

    { id: "xeomin", name: "제오민", nameEn: "Xeomin", brand: "Merz", category: "주름/보톡스", subcategory: "보톡스브랜드", mechanism: { simple: "순수보톡스 항체적음", detailed: "복합단백질제거 내성적음", keywords: ["보톡스", "순수"] }, effects: { primary: ["주름"], secondary: [], notFor: [], onsetTime: "3~7일", duration: "3~6개월" }, procedure: { duration: "부위별", anesthesia: "불필요", sessions: "1회", interval: "3~6개월" }, recovery: { painLevel: 1.5, painDescription: "따끔", downtime: "없음", commonSideEffects: ["주사자국"], recoveryTips: [] }, suitability: { idealAge: "전연령", bestFor: ["내성있는분"], notRecommended: [], skinType: "무관" }, pros: ["내성적음"], cons: ["효과시작느림"], safety: { commonSideEffects: ["멍"], seriousSideEffects: ["드묾"], contraindications: ["신경근육질환"], warnings: [] }, pricing: { range: "부위별", average: "부위별", factors: [] }, comparison: { vs: { "보톡스": "제오민=순수" }, bestWith: [] }, tags: ["보톡스", "제오민", "순수"] },

    { id: "voluma", name: "쥬비덤볼루마", nameEn: "Juvederm Voluma", brand: "Allergan", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "고밀도HA 볼륨/윤곽", detailed: "Vycross기술 리프팅용", keywords: ["HA", "볼륨", "윤곽"] }, effects: { primary: ["볼륨", "광대", "턱"], secondary: ["리프팅"], notFor: ["잔주름"], onsetTime: "즉각", duration: "18~24개월" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "1회", interval: "1.5~2년" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "30대~50대", bestFor: ["볼륨손실"], notRecommended: ["켈로이드"], skinType: "무관" }, pros: ["오래지속", "FDA승인"], cons: ["비용"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["혈관폐색"], contraindications: ["자가면역"], warnings: [] }, pricing: { range: "50~80만원/cc", average: "60만원", factors: [] }, comparison: { vs: {}, bestWith: ["보톡스"] }, tags: ["필러", "볼륨", "쥬비덤"] },

    { id: "restylane-lyft", name: "레스틸렌리프트", nameEn: "Restylane Lyft", brand: "Galderma", category: "필러/볼륨", subcategory: "HA필러", mechanism: { simple: "HA필러 볼륨/리프팅", detailed: "NASHA기술", keywords: ["HA", "볼륨"] }, effects: { primary: ["볼륨", "리프팅"], secondary: [], notFor: ["잔주름"], onsetTime: "즉각", duration: "12~18개월" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "1회", interval: "1~1.5년" }, recovery: { painLevel: 2, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["냉찜질"] }, suitability: { idealAge: "30대~50대", bestFor: ["볼륨"], notRecommended: ["켈로이드"], skinType: "무관" }, pros: ["검증된브랜드"], cons: ["비용"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["혈관폐색"], contraindications: ["자가면역"], warnings: [] }, pricing: { range: "40~70만원/cc", average: "50만원", factors: [] }, comparison: { vs: {}, bestWith: ["보톡스"] }, tags: ["필러", "레스틸렌"] },

    { id: "radiesse", name: "래디에스", nameEn: "Radiesse", brand: "Merz", category: "필러/볼륨", subcategory: "CaHA", mechanism: { simple: "칼슘필러 볼륨+콜라겐", detailed: "CaHA 콜라겐유도", keywords: ["칼슘", "콜라겐"] }, effects: { primary: ["볼륨", "콜라겐"], secondary: ["탄력"], notFor: ["입술"], onsetTime: "즉각+점진", duration: "12~18개월" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "1회", interval: "1~1.5년" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "3~7일", commonSideEffects: ["붓기"], recoveryTips: [] }, suitability: { idealAge: "30대~50대", bestFor: ["볼륨+콜라겐"], notRecommended: ["녹여야할경우"], skinType: "무관" }, pros: ["콜라겐유도", "오래감"], cons: ["녹일수없음", "입술불가"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["결절"], contraindications: ["자가면역"], warnings: [] }, pricing: { range: "50~80만원/cc", average: "60만원", factors: [] }, comparison: { vs: {}, bestWith: [] }, tags: ["필러", "칼슘"] },

    { id: "clear-brilliant", name: "클리어앤브릴리언트", nameEn: "Clear+Brilliant", brand: "Solta", category: "흉터/모공", subcategory: "프랙셔널", mechanism: { simple: "소프트프랙셔널 피부결", detailed: "저출력 재생유도", keywords: ["프랙셔널", "소프트"] }, effects: { primary: ["피부결", "톤업"], secondary: ["모공"], notFor: ["깊은흉터"], onsetTime: "1~2주", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "4~6회", interval: "2~4주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["홍반"], recoveryTips: ["보습"] }, suitability: { idealAge: "20대~40대", bestFor: ["피부결", "예방관리"], notRecommended: ["깊은흉터"], skinType: "모든피부" }, pros: ["다운타임적음"], cons: ["효과약함"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "15~30만원/회", average: "20만원", factors: [] }, comparison: { vs: { "프락셀": "소프트버전" }, bestWith: ["스킨부스터"] }, tags: ["프랙셔널", "피부결"] },

    { id: "subcision", name: "서브시전", nameEn: "Subcision", brand: "시술", category: "흉터/모공", subcategory: "흉터치료", mechanism: { simple: "바늘로 흉터밑 섬유조직절단", detailed: "피하박리술", keywords: ["흉터", "박리"] }, effects: { primary: ["패인흉터"], secondary: [], notFor: ["아이스픽"], onsetTime: "1~3개월", duration: "영구적" }, procedure: { duration: "30~60분", anesthesia: "국소마취", sessions: "2~4회", interval: "4~6주" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "7~14일", commonSideEffects: ["붓기", "멍"], recoveryTips: ["압박", "마사지"] }, suitability: { idealAge: "20대~40대", bestFor: ["롤링흉터"], notRecommended: ["켈로이드"], skinType: "모든피부" }, pros: ["근본개선"], cons: ["다운타임"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["감염"], contraindications: ["켈로이드"], warnings: [] }, pricing: { range: "20~50만원/회", average: "30만원", factors: [] }, comparison: { vs: {}, bestWith: ["프락셀"] }, tags: ["흉터", "서브시전"] },

    { id: "tca-cross", name: "TCA CROSS", nameEn: "TCA CROSS", brand: "시술", category: "흉터/모공", subcategory: "흉터치료", mechanism: { simple: "고농도TCA 아이스픽흉터", detailed: "흉터바닥자극 재생", keywords: ["TCA", "아이스픽"] }, effects: { primary: ["아이스픽흉터"], secondary: [], notFor: ["넓은흉터"], onsetTime: "2~4주", duration: "점진개선" }, procedure: { duration: "15~30분", anesthesia: "불필요", sessions: "3~6회", interval: "2~4주" }, recovery: { painLevel: 2, painDescription: "따가움", downtime: "5~10일", commonSideEffects: ["딱지"], recoveryTips: ["딱지건드리지않기"] }, suitability: { idealAge: "20대~40대", bestFor: ["아이스픽흉터"], notRecommended: ["넓은흉터"], skinType: "밝은피부" }, pros: ["아이스픽특화"], cons: ["밝은피부적합"], safety: { commonSideEffects: ["딱지"], seriousSideEffects: ["색소침착"], contraindications: ["켈로이드"], warnings: [] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: {}, bestWith: ["서브시전"] }, tags: ["흉터", "TCA"] },

    { id: "pdt", name: "PDT광역동", nameEn: "PDT", brand: "다양", category: "여드름/트러블", subcategory: "광선치료", mechanism: { simple: "광감작제+광선 피지선파괴", detailed: "ALA+광조사 살균/피지선축소", keywords: ["PDT", "여드름"] }, effects: { primary: ["여드름", "피지감소"], secondary: ["모공"], notFor: ["흉터"], onsetTime: "2~4주", duration: "유지관리" }, procedure: { duration: "60~90분", anesthesia: "마취크림", sessions: "3~5회", interval: "2~4주" }, recovery: { painLevel: 2.5, painDescription: "화끈거림", downtime: "3~7일", commonSideEffects: ["홍반", "각질"], recoveryTips: ["자외선차단", "야외피하기"] }, suitability: { idealAge: "10대~40대", bestFor: ["중등도여드름"], notRecommended: ["광과민증"], skinType: "지성" }, pros: ["근본치료"], cons: ["다운타임", "광차단필수"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착"], contraindications: ["광과민증"], warnings: ["48시간광차단"] }, pricing: { range: "15~30만원/회", average: "20만원", factors: [] }, comparison: { vs: { "아그네스": "PDT=광선" }, bestWith: ["스킨케어"] }, tags: ["여드름", "PDT"] },

    { id: "carboxy", name: "카복시", nameEn: "Carboxy Therapy", brand: "다양", category: "바디/지방", subcategory: "순환", mechanism: { simple: "CO2가스 지방분해+순환", detailed: "이산화탄소 혈류증가", keywords: ["CO2", "순환"] }, effects: { primary: ["지방분해", "셀룰라이트"], secondary: ["다크서클"], notFor: ["대량지방"], onsetTime: "5~10회", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 1.5, painDescription: "팽팽함", downtime: "없음", commonSideEffects: ["팽팽함"], recoveryTips: ["마사지"] }, suitability: { idealAge: "20대~50대", bestFor: ["셀룰라이트", "다크서클"], notRecommended: ["심장질환"], skinType: "무관" }, pros: ["다목적", "순환개선"], cons: ["여러회"], safety: { commonSideEffects: ["팽팽함"], seriousSideEffects: ["드묾"], contraindications: ["심장질환"], warnings: [] }, pricing: { range: "3~10만원/회", average: "5만원", factors: [] }, comparison: { vs: {}, bestWith: ["지방분해주사"] }, tags: ["카복시", "순환"] },

    { id: "stretchmark", name: "튼살레이저", nameEn: "Stretch Mark Laser", brand: "다양", category: "바디/지방", subcategory: "튼살", mechanism: { simple: "프랙셔널레이저 튼살개선", detailed: "튼살조직재생유도", keywords: ["튼살", "프랙셔널"] }, effects: { primary: ["튼살개선"], secondary: [], notFor: ["완전제거"], onsetTime: "3~5회후", duration: "영구개선" }, procedure: { duration: "30~60분", anesthesia: "마취크림", sessions: "5~10회", interval: "4~6주" }, recovery: { painLevel: 2.5, painDescription: "따끔", downtime: "3~7일", commonSideEffects: ["홍반"], recoveryTips: ["보습"] }, suitability: { idealAge: "20대~50대", bestFor: ["튼살"], notRecommended: ["켈로이드"], skinType: "모든피부" }, pros: ["튼살개선"], cons: ["완전제거불가"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["색소침착"], contraindications: ["켈로이드"], warnings: [] }, pricing: { range: "20~50만원/회", average: "30만원", factors: [] }, comparison: { vs: {}, bestWith: ["카복시"] }, tags: ["튼살", "레이저"] },

    { id: "mts", name: "MTS", nameEn: "MTS", brand: "다양", category: "흉터/모공", subcategory: "재생", mechanism: { simple: "미세바늘 재생유도", detailed: "진피자극 콜라겐재생", keywords: ["MTS", "재생"] }, effects: { primary: ["모공", "피부결"], secondary: ["흉터"], notFor: ["심한흉터"], onsetTime: "4~6주", duration: "유지관리" }, procedure: { duration: "30~40분", anesthesia: "마취크림", sessions: "4~6회", interval: "2~4주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "1~3일", commonSideEffects: ["홍반"], recoveryTips: ["보습"] }, suitability: { idealAge: "20대~50대", bestFor: ["모공", "피부결"], notRecommended: ["활동성여드름"], skinType: "모든피부" }, pros: ["재생효과", "앰플침투↑"], cons: ["다운타임"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["감염"], contraindications: ["켈로이드"], warnings: ["위생중요"] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: { "MRF": "MTS=바늘만" }, bestWith: ["앰플"] }, tags: ["MTS", "재생"] },

    { id: "carbonpeel", name: "카본필링", nameEn: "Carbon Peel", brand: "다양", category: "스킨케어", subcategory: "필링", mechanism: { simple: "카본크림+레이저 모공청소", detailed: "카본흡착후레이저제거", keywords: ["카본", "모공"] }, effects: { primary: ["모공", "피지"], secondary: ["톤업"], notFor: ["리프팅"], onsetTime: "즉각", duration: "2~4주" }, procedure: { duration: "30~40분", anesthesia: "불필요", sessions: "정기관리", interval: "2~4주" }, recovery: { painLevel: 1, painDescription: "따뜻함", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["보습"] }, suitability: { idealAge: "10대~40대", bestFor: ["모공", "지성피부"], notRecommended: ["광과민증"], skinType: "지성" }, pros: ["모공효과", "다운타임없음"], cons: ["유지필요"], safety: { commonSideEffects: ["드묾"], seriousSideEffects: ["드묾"], contraindications: ["광과민증"], warnings: [] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: {}, bestWith: ["토닝"] }, tags: ["카본", "모공"] },

    { id: "glycolic", name: "글리콜산필링", nameEn: "Glycolic Acid Peel", brand: "다양", category: "필링", subcategory: "화학필링", mechanism: { simple: "AHA 각질제거 피부결개선", detailed: "글리콜산 각질용해", keywords: ["AHA", "각질"] }, effects: { primary: ["각질", "피부결"], secondary: ["톤업"], notFor: ["민감성"], onsetTime: "1~2주", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "4~6회", interval: "2~4주" }, recovery: { painLevel: 1.5, painDescription: "따가움", downtime: "2~5일", commonSideEffects: ["각질"], recoveryTips: ["보습", "자외선차단"] }, suitability: { idealAge: "20대~50대", bestFor: ["각질", "칙칙함"], notRecommended: ["민감성"], skinType: "지성" }, pros: ["피부결개선"], cons: ["자극"], safety: { commonSideEffects: ["각질"], seriousSideEffects: ["색소침착"], contraindications: ["민감성"], warnings: ["자외선차단"] }, pricing: { range: "3~10만원/회", average: "5만원", factors: [] }, comparison: { vs: {}, bestWith: ["스킨케어"] }, tags: ["필링", "AHA"] },

    { id: "salicylic", name: "살리실산필링", nameEn: "Salicylic Acid Peel", brand: "다양", category: "필링", subcategory: "화학필링", mechanism: { simple: "BHA 모공속피지/각질제거", detailed: "지용성살리실산 모공침투", keywords: ["BHA", "모공"] }, effects: { primary: ["모공", "여드름"], secondary: ["각질"], notFor: ["건성"], onsetTime: "1~2주", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "4~6회", interval: "2~4주" }, recovery: { painLevel: 1.5, painDescription: "따가움", downtime: "2~5일", commonSideEffects: ["건조"], recoveryTips: ["보습"] }, suitability: { idealAge: "10대~40대", bestFor: ["여드름", "모공"], notRecommended: ["건성"], skinType: "지성" }, pros: ["여드름효과"], cons: ["건조"], safety: { commonSideEffects: ["건조"], seriousSideEffects: ["드묾"], contraindications: ["아스피린알러지"], warnings: [] }, pricing: { range: "3~10만원/회", average: "5만원", factors: [] }, comparison: { vs: {}, bestWith: ["여드름관리"] }, tags: ["필링", "BHA"] },

    { id: "hairtransplant", name: "모발이식", nameEn: "Hair Transplant", brand: "시술", category: "탈모", subcategory: "수술", mechanism: { simple: "후두부모낭을 탈모부위이식", detailed: "FUE/FUT 모낭이식", keywords: ["모발이식", "탈모"] }, effects: { primary: ["탈모개선"], secondary: [], notFor: ["공여부부족"], onsetTime: "6~12개월", duration: "영구적" }, procedure: { duration: "4~8시간", anesthesia: "국소마취+수면", sessions: "1~2회", interval: "6개월~1년" }, recovery: { painLevel: 2.5, painDescription: "뻐근함", downtime: "7~14일", commonSideEffects: ["붓기", "딱지"], recoveryTips: ["머리감기주의"] }, suitability: { idealAge: "20대~60대", bestFor: ["M자탈모", "헤어라인"], notRecommended: ["진행중탈모심함"], skinType: "무관" }, pros: ["영구적", "자연스러움"], cons: ["비용높음"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["생착실패"], contraindications: ["출혈성질환"], warnings: ["경험많은의사"] }, pricing: { range: "500~1500만원", average: "800만원", factors: ["모수"] }, comparison: { vs: {}, bestWith: ["약물치료"] }, tags: ["탈모", "모발이식"] },

    { id: "scalpmeso", name: "두피메조", nameEn: "Scalp Mesotherapy", brand: "다양", category: "탈모", subcategory: "주사", mechanism: { simple: "두피에영양성분주입 탈모개선", detailed: "성장인자/비타민 직접주입", keywords: ["두피", "메조"] }, effects: { primary: ["탈모개선"], secondary: ["두피건강"], notFor: ["고도탈모"], onsetTime: "3~6개월", duration: "유지관리" }, procedure: { duration: "20~30분", anesthesia: "마취크림", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "없음", commonSideEffects: ["붓기"], recoveryTips: ["다음날샴푸"] }, suitability: { idealAge: "20대~50대", bestFor: ["초기탈모"], notRecommended: ["고도탈모"], skinType: "무관" }, pros: ["비수술", "영양직접전달"], cons: ["여러회"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["감염"], contraindications: ["두피질환"], warnings: [] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: {}, bestWith: ["PRP"] }, tags: ["탈모", "메조"] },

    { id: "scalpprp", name: "두피PRP", nameEn: "Scalp PRP", brand: "자가혈", category: "탈모", subcategory: "주사", mechanism: { simple: "자가혈성장인자 두피재생", detailed: "혈소판풍부혈장 모낭활성화", keywords: ["PRP", "두피"] }, effects: { primary: ["탈모개선"], secondary: [], notFor: ["고도탈모"], onsetTime: "3~6개월", duration: "유지관리" }, procedure: { duration: "40~60분", anesthesia: "마취크림", sessions: "6~10회", interval: "2~4주" }, recovery: { painLevel: 2, painDescription: "따끔", downtime: "없음", commonSideEffects: ["붓기"], recoveryTips: ["당일샴푸피하기"] }, suitability: { idealAge: "20대~50대", bestFor: ["초중기탈모"], notRecommended: ["혈액질환"], skinType: "무관" }, pros: ["자가혈안전"], cons: ["여러회"], safety: { commonSideEffects: ["붓기"], seriousSideEffects: ["감염"], contraindications: ["혈액질환"], warnings: [] }, pricing: { range: "15~30만원/회", average: "20만원", factors: [] }, comparison: { vs: {}, bestWith: ["메조"] }, tags: ["탈모", "PRP"] },

    { id: "placenta", name: "태반주사", nameEn: "Placenta Injection", brand: "라이넥/멜스몬", category: "주사/수액", subcategory: "재생", mechanism: { simple: "태반추출물 피로회복/재생", detailed: "성장인자/아미노산 재생촉진", keywords: ["태반", "재생"] }, effects: { primary: ["피로회복", "재생"], secondary: ["미백"], notFor: ["국소치료"], onsetTime: "10회이상", duration: "유지관리" }, procedure: { duration: "10~15분", anesthesia: "불필요", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 1.5, painDescription: "주사통증", downtime: "없음", commonSideEffects: ["주사부위통증"], recoveryTips: [] }, suitability: { idealAge: "30대~60대", bestFor: ["피로", "갱년기"], notRecommended: ["임산부"], skinType: "무관" }, pros: ["피로회복", "재생"], cons: ["여러회"], safety: { commonSideEffects: ["주사통증"], seriousSideEffects: ["알러지"], contraindications: ["임산부"], warnings: [] }, pricing: { range: "2~5만원/회", average: "3만원", factors: [] }, comparison: { vs: {}, bestWith: ["비타민주사"] }, tags: ["태반", "재생"] },

    { id: "vitaminc", name: "비타민C고용량", nameEn: "High-dose Vitamin C", brand: "다양", category: "주사/수액", subcategory: "영양", mechanism: { simple: "고용량비타민C 항산화/미백", detailed: "콜라겐합성촉진 항산화", keywords: ["비타민C", "항산화"] }, effects: { primary: ["피로회복", "미백"], secondary: ["면역"], notFor: ["국소치료"], onsetTime: "꾸준히", duration: "유지관리" }, procedure: { duration: "30~60분", anesthesia: "불필요", sessions: "10~20회", interval: "주1~2회" }, recovery: { painLevel: 1, painDescription: "주사통증", downtime: "없음", commonSideEffects: ["없음"], recoveryTips: ["수분섭취"] }, suitability: { idealAge: "20대~60대", bestFor: ["피로", "흡연자"], notRecommended: ["신장질환"], skinType: "무관" }, pros: ["피로회복", "항산화"], cons: ["여러회"], safety: { commonSideEffects: ["드묾"], seriousSideEffects: ["신장결석"], contraindications: ["신장질환"], warnings: ["신장기능확인"] }, pricing: { range: "3~10만원/회", average: "5만원", factors: [] }, comparison: { vs: {}, bestWith: ["백옥주사"] }, tags: ["비타민C", "항산화"] },

    { id: "garlic", name: "마늘주사", nameEn: "Garlic IV", brand: "다양", category: "주사/수액", subcategory: "영양", mechanism: { simple: "비타민B1 피로회복", detailed: "에너지대사촉진", keywords: ["마늘", "비타민B1"] }, effects: { primary: ["피로회복"], secondary: ["숙취해소"], notFor: ["국소"], onsetTime: "즉각~다음날", duration: "며칠" }, procedure: { duration: "5~10분", anesthesia: "불필요", sessions: "필요시", interval: "주1~2회" }, recovery: { painLevel: 1, painDescription: "주사통증", downtime: "없음", commonSideEffects: ["마늘냄새"], recoveryTips: [] }, suitability: { idealAge: "20대~60대", bestFor: ["피로", "숙취"], notRecommended: ["B1알러지"], skinType: "무관" }, pros: ["빠른피로회복"], cons: ["냄새"], safety: { commonSideEffects: ["마늘냄새"], seriousSideEffects: ["알러지"], contraindications: ["B1알러지"], warnings: [] }, pricing: { range: "1~3만원/회", average: "2만원", factors: [] }, comparison: { vs: {}, bestWith: ["비타민주사"] }, tags: ["마늘", "피로"] },

    { id: "airjet", name: "에어젯", nameEn: "AirJet", brand: "다양", category: "스킨부스터", subcategory: "무바늘", mechanism: { simple: "고압공기 무바늘약물침투", detailed: "제트분사 진피침투", keywords: ["에어젯", "무바늘"] }, effects: { primary: ["보습", "탄력"], secondary: [], notFor: ["깊은침투"], onsetTime: "즉각", duration: "2~4주" }, procedure: { duration: "20~30분", anesthesia: "불필요", sessions: "정기관리", interval: "2~4주" }, recovery: { painLevel: 0.5, painDescription: "살짝따끔", downtime: "없음", commonSideEffects: ["홍반"], recoveryTips: ["보습"] }, suitability: { idealAge: "20대~50대", bestFor: ["주사무서운분"], notRecommended: [], skinType: "모든피부" }, pros: ["무통증", "무바늘"], cons: ["효과약함"], safety: { commonSideEffects: ["홍반"], seriousSideEffects: ["드묾"], contraindications: ["피부질환"], warnings: [] }, pricing: { range: "5~15만원/회", average: "10만원", factors: [] }, comparison: { vs: { "물광": "에어젯=무바늘" }, bestWith: ["다른시술후"] }, tags: ["에어젯", "무바늘"] }
  ]
};

// 유틸리티 함수
function getTreatmentById(id) {
  return DB_EXTENDED.treatments.find(t => t.id === id);
}

function getTreatmentsByCategory(category) {
  return DB_EXTENDED.treatments.filter(t => t.category === category);
}

function getTreatmentsByTag(tag) {
  return DB_EXTENDED.treatments.filter(t => t.tags.includes(tag));
}

function searchTreatments(query) {
  const q = query.toLowerCase();
  return DB_EXTENDED.treatments.filter(t => 
    t.name.includes(q) || 
    t.nameEn.toLowerCase().includes(q) ||
    t.tags.some(tag => tag.includes(q)) ||
    t.mechanism.keywords.some(k => k.toLowerCase().includes(q))
  );
}

console.log("DB_EXTENDED 로드 완료:", DB_EXTENDED.treatments.length, "개 시술");

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DB_EXTENDED, getTreatmentById, getTreatmentsByCategory, getTreatmentsByTag, searchTreatments };
}
