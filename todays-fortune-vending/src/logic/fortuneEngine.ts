// 사주(명리) 오행 기반 "오늘의 재물운" 엔진.
//
// 방법론:
//  1) 생년월일의 '일간(日干)'을 구해 사용자의 본원 오행(목/화/토/금/수)을 정해요.
//  2) 오늘 날짜의 '일간' 오행을 구해 '오늘의 기운'으로 삼아요.
//  3) 두 오행의 상생·상극 관계로 십신(비겁/인성/식상/재성/관성)을 판정하고,
//     재물(財)의 관점에서 점수·코멘트·소비 처방을 만들어요.
//
// 참고: 일간 계산은 그레고리력 율리우스일(JDN) 기반 60갑자로 근사했어요.
//       (앵커: 2000-01-07 = 갑자일) 정밀 만세력(절기 월경계·시주)은 추후 보정 대상이에요.

import { seededRng } from "../utils/rng";

export type Element = "목" | "화" | "토" | "금" | "수";
export type Sipsin = "재성" | "식상" | "인성" | "비겁" | "관성";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
// 천간 → 오행 (갑을=목, 병정=화, 무기=토, 경신=금, 임계=수)
const STEM_ELEMENT: Element[] = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];

// 상생: 목→화→토→금→수→목 / 상극(내가 극하는 것): 목→토, 화→금, 토→수, 금→목, 수→화
const GENERATES: Record<Element, Element> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" };
const CONTROLS: Record<Element, Element> = { 목: "토", 화: "금", 토: "수", 금: "목", 수: "화" };

const ELEMENT_META: Record<
  Element,
  { color: { name: string; hex: string }; direction: string; item: string }
> = {
  목: { color: { name: "청록", hex: "#2ECC71" }, direction: "동쪽", item: "초록색 지갑" },
  화: { color: { name: "레드", hex: "#E74C3C" }, direction: "남쪽", item: "빨간 카드지갑" },
  토: { color: { name: "골드", hex: "#F5A623" }, direction: "중앙", item: "금색 동전" },
  금: { color: { name: "화이트골드", hex: "#FFD35A" }, direction: "서쪽", item: "메탈 카드" },
  수: { color: { name: "딥블루", hex: "#3B70E3" }, direction: "북쪽", item: "파란 저금통" },
};

// 그레고리력 → 율리우스일(JDN)
function toJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

// 그 날의 60갑자 인덱스 (0=갑자). 앵커 2000-01-07=갑자 → 상수 +49
function dayGanzhiIndex(key: string): number {
  const [y, m, d] = key.split("-").map(Number);
  return (((toJDN(y, m, d) + 49) % 60) + 60) % 60;
}

function dayStem(key: string): { stem: string; element: Element } {
  const stemIdx = dayGanzhiIndex(key) % 10;
  return { stem: STEMS[stemIdx], element: STEM_ELEMENT[stemIdx] };
}

/** 두 오행의 관계를 십신으로 판정 (일간 기준) */
function relation(day: Element, today: Element): Sipsin {
  if (today === day) return "비겁"; // 같은 오행 → 경쟁/지출 분산
  if (GENERATES[today] === day) return "인성"; // 오늘이 나를 생함 → 귀인/안정
  if (GENERATES[day] === today) return "식상"; // 내가 오늘을 생함 → 식상생재
  if (CONTROLS[day] === today) return "재성"; // 내가 오늘을 극함 → 재물이 들어옴
  return "관성"; // 오늘이 나를 극함 → 압박/지출
}

const SIPSIN_META: Record<
  Sipsin,
  { band: [number, number]; emoji: string; comment: string }
> = {
  재성: { band: [80, 100], emoji: "🤑", comment: "재물이 직접 들어오는 날! 기회를 잡아요." },
  식상: { band: [66, 84], emoji: "📈", comment: "굴린 만큼 벌리는 날, 아이디어가 돈이 돼요." },
  인성: { band: [50, 68], emoji: "🪙", comment: "귀인의 도움으로 흐름이 안정적이에요." },
  비겁: { band: [32, 50], emoji: "⚠️", comment: "나가는 돈 주의! 경쟁·지출이 겹쳐요." },
  관성: { band: [14, 34], emoji: "🐢", comment: "부담이 커지는 날, 무리한 지출은 금물이에요." },
};

function gradeOf(score: number): string {
  if (score >= 85) return "대박 재물운";
  if (score >= 70) return "두둑한 재물운";
  if (score >= 55) return "잔잔한 상승세";
  if (score >= 40) return "평온한 지갑";
  if (score >= 25) return "지출 주의보";
  return "짠테크의 날";
}

function prescriptionOf(score: number): string {
  if (score >= 80) return "질러도 되는 날 — 과감한 결정이 이득으로 돌아와요.";
  if (score >= 66) return "굴리기 좋은 날 — 소액 재테크·투자 공부를 시작해봐요.";
  if (score >= 50) return "관망하는 날 — 큰 결정은 하루만 미뤄봐요.";
  if (score >= 32) return "지갑 닫는 날 — 충동구매는 잠시 넣어둬요.";
  return "지출 참는 날 — 오늘은 방어가 최선의 재테크예요.";
}

export interface Fortune {
  date: string;
  score: number;
  sipsin: Sipsin;
  grade: string;
  emoji: string;
  comment: string;
  prescription: string;
  dayMaster: { stem: string; element: Element; label: string };
  today: { stem: string; element: Element; label: string };
  luckyElement: Element;
  luckyColor: { name: string; hex: string };
  luckyDirection: string;
  luckyItem: string;
}

/**
 * 생년월일(YYYY-MM-DD)과 오늘 날짜(YYYY-MM-DD)로 오늘의 재물운을 계산해요.
 * 같은 (생일, 날짜)면 항상 같은 결과예요.
 */
export function getFortune(birth: string, today: string): Fortune {
  const dm = dayStem(birth); // 일간 = 본원 오행
  const td = dayStem(today); // 오늘의 기운
  const sipsin = relation(dm.element, td.element);
  const meta = SIPSIN_META[sipsin];

  // 십신 밴드 안에서 (생일+날짜) 시드로 미세 변동을 줘요.
  const rng = seededRng(`jaemulun|${birth}|${today}`);
  const [low, high] = meta.band;
  const score = Math.round(low + rng() * (high - low));

  // 재성(내가 극하는 오행) = 이 사람에게 '돈을 부르는 오행'
  const luckyElement = CONTROLS[dm.element];
  const lm = ELEMENT_META[luckyElement];

  return {
    date: today,
    score,
    sipsin,
    grade: gradeOf(score),
    emoji: meta.emoji,
    comment: meta.comment,
    prescription: prescriptionOf(score),
    dayMaster: { ...dm, label: `${dm.stem}${dm.element} 일간` },
    today: { ...td, label: `오늘 ${td.stem}${td.element}` },
    luckyElement,
    luckyColor: lm.color,
    luckyDirection: lm.direction,
    luckyItem: lm.item,
  };
}
