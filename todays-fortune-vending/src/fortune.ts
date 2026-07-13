// 오늘의 재물운 생성 로직.
//
// 같은 날에는 몇 번을 뽑아도 결과가 같도록, 날짜(YYYY-MM-DD)를 시드로 쓰는
// 결정론적(seeded) 난수를 사용해요. "오늘의" 운세니까요.

export interface Fortune {
  date: string; // YYYY-MM-DD
  score: number; // 0 ~ 100
  tier: string; // 등급 이름
  emoji: string;
  headline: string; // 한 줄 요약
  advice: string; // 재테크 조언
  luckyItem: string; // 행운의 아이템
  luckyColor: { name: string; hex: string }; // 행운의 색
  luckyNumber: number; // 행운의 숫자 (1~45)
}

/** 로컬 날짜를 YYYY-MM-DD 로 반환해요. */
export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 문자열 → 32bit 정수 해시
function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

// mulberry32: 시드 하나로 0~1 난수를 재현성 있게 생성해요.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIERS: { min: number; tier: string; emoji: string; headlines: string[] }[] = [
  {
    min: 90,
    tier: "대박 재물운",
    emoji: "🤑",
    headlines: [
      "지갑이 웃는 날! 들어올 복은 다 들어와요.",
      "오늘은 돈이 돈을 부르는 흐름이에요.",
      "예상 못 한 곳에서 굿뉴스가 도착해요.",
    ],
  },
  {
    min: 75,
    tier: "두둑한 재물운",
    emoji: "💰",
    headlines: [
      "쏠쏠한 이득이 기다리는 하루예요.",
      "작은 결정이 큰 이득으로 돌아와요.",
      "돈 관리에 집중하면 성과가 보여요.",
    ],
  },
  {
    min: 55,
    tier: "잔잔한 상승세",
    emoji: "📈",
    headlines: [
      "천천히, 그러나 확실하게 불어나요.",
      "꾸준함이 통하는 안정적인 날이에요.",
      "무리하지 않으면 플러스로 마감해요.",
    ],
  },
  {
    min: 35,
    tier: "평온한 지갑",
    emoji: "🪙",
    headlines: [
      "큰 변동 없이 무난한 하루예요.",
      "지킬 건 지키는 균형의 날이에요.",
      "현상 유지가 오늘의 승리예요.",
    ],
  },
  {
    min: 15,
    tier: "지출 주의보",
    emoji: "⚠️",
    headlines: [
      "충동구매가 스멀스멀, 카드는 잠시 넣어둬요.",
      "새는 돈을 막으면 본전은 지켜요.",
      "오늘은 '한 번 더 생각하기'가 필요해요.",
    ],
  },
  {
    min: 0,
    tier: "짠테크의 날",
    emoji: "🐢",
    headlines: [
      "느긋하게, 오늘은 아끼는 재미로 가요.",
      "지출을 줄이는 것도 훌륭한 재테크예요.",
      "작은 절약이 내일의 여유가 돼요.",
    ],
  },
];

const ADVICE: string[] = [
  "고정비를 한 줄만 점검해봐요.",
  "잔돈은 자동저축으로 모아봐요.",
  "구독 서비스, 안 쓰는 건 정리해요.",
  "오늘 지출은 기록만 해도 절반은 성공이에요.",
  "목표 금액을 숫자로 적어두면 힘이 나요.",
  "커피 한 잔 값을 투자 계좌로 옮겨봐요.",
  "비교는 어제의 나와만 해요.",
  "충동구매는 하루만 미뤄봐요.",
];

const LUCKY_ITEMS: string[] = [
  "노란 지갑",
  "동전 저금통",
  "금색 볼펜",
  "네잎클로버",
  "작은 화분",
  "손거울",
  "영수증 클립",
  "행운의 열쇠고리",
  "따뜻한 커피",
  "포스트잇",
];

const LUCKY_COLORS: { name: string; hex: string }[] = [
  { name: "골드", hex: "#F5A623" },
  { name: "에메랄드", hex: "#2ECC71" },
  { name: "로열블루", hex: "#3B70E3" },
  { name: "코랄", hex: "#FF6B6B" },
  { name: "라벤더", hex: "#9B59B6" },
  { name: "민트", hex: "#1ABC9C" },
  { name: "선셋오렌지", hex: "#FF8C42" },
  { name: "체리레드", hex: "#E74C3C" },
];

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** 주어진 날짜의 재물운을 생성해요. 같은 날짜면 항상 같은 결과예요. */
export function getFortune(dateKey: string = todayKey()): Fortune {
  const rng = mulberry32(hashString(`jaemulun:${dateKey}`));

  // 점수는 살짝 중상위로 치우치게 (두 난수의 평균) — 기분 좋은 분포로요.
  const score = Math.round(((rng() + rng()) / 2) * 100);

  const tierInfo = TIERS.find((t) => score >= t.min) ?? TIERS[TIERS.length - 1];

  return {
    date: dateKey,
    score,
    tier: tierInfo.tier,
    emoji: tierInfo.emoji,
    headline: pick(rng, tierInfo.headlines),
    advice: pick(rng, ADVICE),
    luckyItem: pick(rng, LUCKY_ITEMS),
    luckyColor: pick(rng, LUCKY_COLORS),
    luckyNumber: 1 + Math.floor(rng() * 45),
  };
}
