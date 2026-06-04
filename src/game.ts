// ─── Types ───────────────────────────────────────────────────────────────────

interface StockDef {
  name: string;
  basePrice: number;
  sector: string;
}

interface StockState {
  poolIdx: number;
  name: string;
  basePrice: number;
  sector: string;
  price: number;
  pctChange: number; // vs basePrice
  held: number;
  totalCost: number;
}

interface GameState {
  cash: number;
  stocks: StockState[];
  purchasedUpgrades: string[];
  rankIdx: number;
  news: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const POOL: StockDef[] = [
  { name: "삼성전자",       basePrice: 72000,   sector: "반도체" },
  { name: "SK하이닉스",     basePrice: 190000,  sector: "반도체" },
  { name: "한미반도체",     basePrice: 120000,  sector: "반도체" },
  { name: "LG에너지솔루션", basePrice: 320000,  sector: "2차전지" },
  { name: "현대차",         basePrice: 245000,  sector: "자동차" },
  { name: "기아",           basePrice: 105000,  sector: "자동차" },
  { name: "카카오",         basePrice: 38000,   sector: "IT" },
  { name: "네이버",         basePrice: 210000,  sector: "IT" },
  { name: "크래프톤",       basePrice: 285000,  sector: "게임" },
  { name: "셀트리온",       basePrice: 155000,  sector: "바이오" },
  { name: "알테오젠",       basePrice: 290000,  sector: "바이오" },
  { name: "HLB",            basePrice: 68000,   sector: "바이오" },
  { name: "POSCO홀딩스",    basePrice: 310000,  sector: "철강" },
  { name: "KB금융",         basePrice: 92000,   sector: "금융" },
  { name: "신한지주",       basePrice: 58000,   sector: "금융" },
  { name: "삼성SDI",        basePrice: 280000,  sector: "2차전지" },
  { name: "두산에너빌리티", basePrice: 24000,   sector: "에너지" },
  { name: "한화에어로스페이스", basePrice: 580000, sector: "방산" },
];

const RANKS = [
  { name: "백수🧍",         threshold: 0 },
  { name: "개미투자자🐜",   threshold: 10000 },
  { name: "주린이📱",       threshold: 50000 },
  { name: "단타왕⚡",       threshold: 200000 },
  { name: "차트마스터📊",   threshold: 800000 },
  { name: "펀드매니저💼",   threshold: 3000000 },
  { name: "헤지펀드대표🏦", threshold: 10000000 },
  { name: "주식왕👑",       threshold: 50000000 },
];

const UPGRADES = [
  { id: "hts",     name: "HTS 설치",       desc: "탭 수익 2배",               cost: 30000,    tapMult: 2,  autoCash: 0     },
  { id: "book",    name: "투자 서적 정독", desc: "탭 수익 3배",               cost: 100000,   tapMult: 3,  autoCash: 0     },
  { id: "report",  name: "증권사 리포트",  desc: "탭 수익 5배",               cost: 500000,   tapMult: 5,  autoCash: 0     },
  { id: "algo",    name: "알고리즘 분석기",desc: "탭 수익 8배",               cost: 2000000,  tapMult: 8,  autoCash: 0     },
  { id: "bot",     name: "AI 트레이딩 봇", desc: "3초마다 자동 수익 50,000원", cost: 5000000,  tapMult: 0,  autoCash: 50000 },
  { id: "insider", name: "내부정보 입수",  desc: "탭 수익 15배",              cost: 20000000, tapMult: 15, autoCash: 0     },
];

const SECTOR_EVENTS = [
  { sector: "반도체",  msg: "반도체 슈퍼사이클 시작!",  mult: 1.08 },
  { sector: "2차전지", msg: "전기차 수요 폭증!",         mult: 1.07 },
  { sector: "IT",      msg: "AI 혁명으로 IT 급등!",      mult: 1.06 },
  { sector: "바이오",  msg: "신약 임상 성공!",            mult: 1.09 },
  { sector: "금융",    msg: "금리 인하 발표!",            mult: 1.05 },
  { sector: "자동차",  msg: "자동차 수출 신기록!",        mult: 1.06 },
  { sector: "반도체",  msg: "반도체 재고 과잉 우려",      mult: 0.93 },
  { sector: "바이오",  msg: "임상 3상 실패...",           mult: 0.88 },
  { sector: "2차전지", msg: "전기차 캐즘 심화",           mult: 0.92 },
];

// ─── Entry point ──────────────────────────────────────────────────────────────

export function initGame(root: HTMLElement) {
  // ── State ──
  let state: GameState;
  let openIdx: number | null = null;
  let activeTab = "market";

  // ── Jakjeon ──
  let isJakjeonActive = false;
  let jakjeonTargetIdx = -1;
  let jakjeonCountdownTimer: ReturnType<typeof setInterval> | null = null;
  let jakjeonNextTimer: ReturnType<typeof setTimeout> | null = null;

  // ── DOM refs ──
  let rankEl: HTMLElement;
  let cashEl: HTMLElement;
  let totalEl: HTMLElement;
  let eventBoxEl: HTMLElement;
  let tabContentEl: HTMLElement;
  let eventClearTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── Save / Load ────────────────────────────────────────────────────────────

  function save() {
    localStorage.setItem("jusikwang_v1", JSON.stringify(state));
  }

  function load(): GameState | null {
    try {
      const raw = localStorage.getItem("jusikwang_v1");
      return raw ? (JSON.parse(raw) as GameState) : null;
    } catch {
      return null;
    }
  }

  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function defaultState(): GameState {
    const indices = shuffle(POOL.map((_, i) => i)).slice(0, 5);
    return {
      cash: 5000,
      stocks: indices.map((pi) => ({
        poolIdx: pi,
        name: POOL[pi].name,
        basePrice: POOL[pi].basePrice,
        sector: POOL[pi].sector,
        price: POOL[pi].basePrice,
        pctChange: 0,
        held: 0,
        totalCost: 0,
      })),
      purchasedUpgrades: [],
      rankIdx: 0,
      news: ["🎮 게임을 시작합니다! 💰를 탭해서 현금을 모으세요!"],
    };
  }

  // ─── Formatters ─────────────────────────────────────────────────────────────

  function fmt(n: number) {
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }

  function fmtShort(n: number) {
    if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + "억원";
    if (n >= 10_000)      return (n / 10_000).toFixed(0) + "만원";
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }

  function fmtP(p: number) {
    return (p >= 0 ? "+" : "") + p.toFixed(2) + "%";
  }

  // ─── Game helpers ───────────────────────────────────────────────────────────

  function getTapAmount(): number {
    const mults = UPGRADES.filter(
      (u) => u.tapMult > 0 && state.purchasedUpgrades.includes(u.id)
    ).map((u) => u.tapMult);
    return 1000 * (mults.length ? Math.max(...mults) : 1);
  }

  function totalAssets(): number {
    return state.cash + state.stocks.reduce((s, x) => s + x.held * x.price, 0);
  }

  function checkRank() {
    const total = totalAssets();
    let newIdx = 0;
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (total >= RANKS[i].threshold) { newIdx = i; break; }
    }
    if (newIdx > state.rankIdx) {
      state.rankIdx = newIdx;
      addNews(`🎉 직급 승급! ${RANKS[newIdx].name} 달성!`, "rank");
      showEvent(`🎖️ ${RANKS[newIdx].name} 달성!`, "rank");
    }
  }

  function addNews(text: string, _type = "normal") {
    const d = new Date();
    const t = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    state.news.unshift(`[${t}] ${text}`);
    if (state.news.length > 60) state.news.pop();
    if (activeTab === "news") renderNews();
  }

  // ─── DOM helpers ────────────────────────────────────────────────────────────

  function el(tag: string, cls = "") {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  // ─── Build skeleton DOM ─────────────────────────────────────────────────────

  // Characters evolve dramatically with rank — custom SVG cartoon characters
  const CHAR_STAGES = [
    // 0. 백수 — 진짜 거지, 바닥에 주저앉아 울고 있음
    { bg:"#c8d8a0", desc:"월세도 못 낸다...",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="110" height="110">
  <!-- body (sitting hunched, torn shirt) -->
  <ellipse cx="60" cy="118" rx="28" ry="16" fill="#a0785a"/>
  <rect x="38" y="92" width="44" height="30" rx="8" fill="#d4a96a"/>
  <!-- torn shirt patches -->
  <polygon points="42,100 50,95 48,108" fill="#c4924a" opacity="0.6"/>
  <polygon points="74,105 82,100 80,115" fill="#c4924a" opacity="0.6"/>
  <!-- arms hunched forward -->
  <ellipse cx="34" cy="105" rx="9" ry="6" fill="#FFCBA4" transform="rotate(-30,34,105)"/>
  <ellipse cx="86" cy="105" rx="9" ry="6" fill="#FFCBA4" transform="rotate(30,86,105)"/>
  <!-- bucket prop -->
  <rect x="50" y="118" width="20" height="14" rx="3" fill="#888" stroke="#666" stroke-width="1.5"/>
  <line x1="50" y1="120" x2="70" y2="120" stroke="#666" stroke-width="1.5"/>
  <!-- neck -->
  <rect x="54" y="76" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head (big, bald) -->
  <ellipse cx="60" cy="54" rx="32" ry="30" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="28" cy="56" rx="7" ry="9" fill="#F5B898"/>
  <ellipse cx="92" cy="56" rx="7" ry="9" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="40" cy="62" rx="9" ry="7" fill="#FF9999" opacity="0.38"/>
  <ellipse cx="80" cy="62" rx="9" ry="7" fill="#FF9999" opacity="0.38"/>
  <!-- sad eyes with tears -->
  <ellipse cx="48" cy="50" rx="6" ry="7" fill="#333"/>
  <ellipse cx="72" cy="50" rx="6" ry="7" fill="#333"/>
  <circle cx="51" cy="47" r="2" fill="white"/>
  <circle cx="75" cy="47" r="2" fill="white"/>
  <!-- tear drops -->
  <ellipse cx="44" cy="62" rx="3" ry="5" fill="#88BBFF" opacity="0.8"/>
  <ellipse cx="68" cy="62" rx="3" ry="5" fill="#88BBFF" opacity="0.8"/>
  <!-- crying mouth -->
  <path d="M50 68 Q60 62 70 68" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`},
    // 1. 개미투자자 — 쪼들리는 직장인, 땀 흘리며 핸드폰
    { bg:"#b8d4c0", desc:"적금 깨서 첫 투자...",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="100" height="110">
  <!-- legs -->
  <rect x="48" y="110" width="12" height="30" rx="5" fill="#555"/>
  <rect x="60" y="110" width="12" height="30" rx="5" fill="#555"/>
  <!-- body (white shirt) -->
  <rect x="36" y="80" width="48" height="38" rx="10" fill="#f0f0f0"/>
  <!-- tie -->
  <polygon points="58,82 62,82 64,105 60,110 56,105" fill="#e05050"/>
  <!-- arm holding phone -->
  <rect x="80" y="85" width="10" height="24" rx="5" fill="#FFCBA4" transform="rotate(15,80,85)"/>
  <!-- phone -->
  <rect x="86" y="88" width="16" height="24" rx="3" fill="#222" transform="rotate(15,86,88)"/>
  <rect x="88" y="91" width="12" height="18" rx="2" fill="#44aaff" transform="rotate(15,88,91)"/>
  <!-- other arm -->
  <rect x="30" y="85" width="10" height="22" rx="5" fill="#FFCBA4" transform="rotate(-10,30,85)"/>
  <!-- neck -->
  <rect x="54" y="70" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head -->
  <ellipse cx="60" cy="48" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="50" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="50" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="56" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <ellipse cx="79" cy="56" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <!-- worried eyes -->
  <ellipse cx="49" cy="44" rx="6" ry="7" fill="#333"/>
  <ellipse cx="71" cy="44" rx="6" ry="7" fill="#333"/>
  <circle cx="52" cy="41" r="2" fill="white"/>
  <circle cx="74" cy="41" r="2" fill="white"/>
  <!-- sweat drop -->
  <ellipse cx="88" cy="36" rx="4" ry="6" fill="#88CCFF" opacity="0.85"/>
  <!-- nervous mouth -->
  <path d="M50 60 Q60 66 70 60" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- brow furrow -->
  <path d="M43 36 Q49 32 53 37" stroke="#333" stroke-width="2" fill="none"/>
  <path d="M67 37 Q71 32 77 36" stroke="#333" stroke-width="2" fill="none"/>
</svg>`},
    // 2. 주린이 — 놀란 눈, 파란 후드, 구겨진 차트
    { bg:"#a8c8e0", desc:"유튜브로 공부했어요",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="100" height="110">
  <!-- legs -->
  <rect x="48" y="110" width="12" height="30" rx="5" fill="#336699"/>
  <rect x="60" y="110" width="12" height="30" rx="5" fill="#336699"/>
  <!-- hoodie body -->
  <rect x="34" y="78" width="52" height="40" rx="12" fill="#4488cc"/>
  <!-- hoodie front pocket -->
  <rect x="46" y="100" width="28" height="14" rx="6" fill="#3377bb"/>
  <!-- arm holding crumpled chart -->
  <rect x="80" y="84" width="10" height="22" rx="5" fill="#FFCBA4" transform="rotate(20,80,84)"/>
  <!-- crumpled chart -->
  <rect x="84" y="80" width="22" height="18" rx="2" fill="#fffde7" transform="rotate(20,84,80)"/>
  <path d="M86 92 l4-6 l4 4 l4-8" stroke="#e53935" stroke-width="1.5" fill="none" transform="rotate(20,86,92)"/>
  <!-- other arm -->
  <rect x="30" y="84" width="10" height="22" rx="5" fill="#FFCBA4" transform="rotate(-20,30,84)"/>
  <!-- neck -->
  <rect x="54" y="68" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- hoodie hood -->
  <path d="M32 62 Q60 28 88 62" fill="#3377bb"/>
  <!-- head -->
  <ellipse cx="60" cy="46" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="48" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="48" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="54" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <ellipse cx="79" cy="54" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <!-- surprised wide eyes -->
  <ellipse cx="49" cy="42" rx="8" ry="9" fill="white" stroke="#333" stroke-width="1"/>
  <ellipse cx="71" cy="42" rx="8" ry="9" fill="white" stroke="#333" stroke-width="1"/>
  <ellipse cx="49" cy="43" rx="5" ry="6" fill="#333"/>
  <ellipse cx="71" cy="43" rx="5" ry="6" fill="#333"/>
  <circle cx="52" cy="40" r="2" fill="white"/>
  <circle cx="74" cy="40" r="2" fill="white"/>
  <!-- surprised mouth O -->
  <ellipse cx="60" cy="60" rx="6" ry="7" fill="#333"/>
  <ellipse cx="60" cy="61" rx="4" ry="5" fill="#cc6666"/>
</svg>`},
    // 3. 단타왕 — 별눈, 오렌지 줄무늬, 폰 두개
    { bg:"#f0d080", desc:"손이 빠르면 장땡!",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="100" height="110">
  <!-- legs (spread energetically) -->
  <rect x="44" y="108" width="12" height="30" rx="5" fill="#cc7722" transform="rotate(-8,44,108)"/>
  <rect x="64" y="108" width="12" height="30" rx="5" fill="#cc7722" transform="rotate(8,64,108)"/>
  <!-- body (orange striped shirt) -->
  <rect x="34" y="76" width="52" height="40" rx="10" fill="#ff8c00"/>
  <rect x="34" y="85" width="52" height="5" fill="#e07000"/>
  <rect x="34" y="98" width="52" height="5" fill="#e07000"/>
  <!-- left arm + phone -->
  <rect x="24" y="80" width="12" height="22" rx="5" fill="#FFCBA4" transform="rotate(-25,24,80)"/>
  <rect x="10" y="84" width="15" height="22" rx="3" fill="#222" transform="rotate(-25,10,84)"/>
  <rect x="12" y="87" width="11" height="16" rx="2" fill="#44aaff" transform="rotate(-25,12,87)"/>
  <!-- right arm + phone -->
  <rect x="84" y="80" width="12" height="22" rx="5" fill="#FFCBA4" transform="rotate(25,96,80)"/>
  <rect x="96" y="84" width="15" height="22" rx="3" fill="#222" transform="rotate(25,96,84)"/>
  <rect x="98" y="87" width="11" height="16" rx="2" fill="#44aaff" transform="rotate(25,98,87)"/>
  <!-- neck -->
  <rect x="54" y="66" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head -->
  <ellipse cx="60" cy="44" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.45"/>
  <ellipse cx="79" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.45"/>
  <!-- star eyes -->
  <text x="42" y="50" font-size="16" fill="#FFD700" text-anchor="middle">★</text>
  <text x="78" y="50" font-size="16" fill="#FFD700" text-anchor="middle">★</text>
  <!-- excited mouth -->
  <path d="M46 62 Q60 74 74 62" stroke="#333" stroke-width="2.5" fill="#ff6666" stroke-linecap="round"/>
  <!-- speed lines -->
  <line x1="2" y1="50" x2="18" y2="54" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="2" y1="60" x2="16" y2="60" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="102" y1="50" x2="118" y2="54" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
  <line x1="104" y1="60" x2="118" y2="60" stroke="#FFD700" stroke-width="2" opacity="0.7"/>
</svg>`},
    // 4. 차트마스터 — 침착한 표정, 외알안경, 짙은 코트, 노트북
    { bg:"#d0c8f0", desc:"이 패턴은 상승이야",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="100" height="110">
  <!-- legs -->
  <rect x="48" y="110" width="12" height="30" rx="5" fill="#2a2a3a"/>
  <rect x="60" y="110" width="12" height="30" rx="5" fill="#2a2a3a"/>
  <!-- trench coat body -->
  <rect x="32" y="76" width="56" height="42" rx="10" fill="#3a3a5a"/>
  <!-- coat lapels -->
  <polygon points="60,78 50,90 60,85" fill="#2a2a4a"/>
  <polygon points="60,78 70,90 60,85" fill="#2a2a4a"/>
  <!-- belt -->
  <rect x="32" y="104" width="56" height="6" rx="3" fill="#2a2a4a"/>
  <!-- arm holding laptop -->
  <rect x="78" y="82" width="11" height="24" rx="5" fill="#FFCBA4" transform="rotate(15,78,82)"/>
  <!-- laptop -->
  <rect x="82" y="78" width="28" height="20" rx="2" fill="#555" transform="rotate(15,82,78)"/>
  <rect x="84" y="80" width="24" height="16" rx="1" fill="#00cc88" transform="rotate(15,84,80)"/>
  <path d="M88 90 l3-5 l3 3 l3-6 l3 4" stroke="white" stroke-width="1.2" fill="none" transform="rotate(15,88,90)"/>
  <!-- other arm -->
  <rect x="30" y="82" width="10" height="24" rx="5" fill="#FFCBA4"/>
  <!-- neck -->
  <rect x="54" y="66" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head -->
  <ellipse cx="60" cy="44" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <ellipse cx="79" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <!-- calm eyes -->
  <ellipse cx="48" cy="42" rx="6" ry="7" fill="#333"/>
  <ellipse cx="72" cy="42" rx="6" ry="7" fill="#333"/>
  <circle cx="51" cy="39" r="2" fill="white"/>
  <circle cx="75" cy="39" r="2" fill="white"/>
  <!-- monocle on right eye -->
  <circle cx="72" cy="42" r="10" fill="none" stroke="#cc9900" stroke-width="2"/>
  <line x1="81" y1="49" x2="86" y2="55" stroke="#cc9900" stroke-width="1.5"/>
  <!-- calm slight smile -->
  <path d="M50 58 Q60 64 70 58" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`},
    // 5. 펀드매니저 — 반 내려뜬 눈, 네이비 슈트, 서류가방
    { bg:"#f0c870", desc:"타인의 돈으로 투자",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" width="100" height="110">
  <!-- legs -->
  <rect x="48" y="110" width="12" height="30" rx="5" fill="#1a2a5a"/>
  <rect x="60" y="110" width="12" height="30" rx="5" fill="#1a2a5a"/>
  <!-- suit body -->
  <rect x="33" y="76" width="54" height="42" rx="10" fill="#1e3a8a"/>
  <!-- shirt & tie -->
  <rect x="52" y="76" width="16" height="42" fill="white"/>
  <polygon points="58,78 62,78 64,108 60,114 56,108" fill="#8833cc"/>
  <!-- suit lapels -->
  <polygon points="52,76 36,92 52,86" fill="#162d72"/>
  <polygon points="68,76 84,92 68,86" fill="#162d72"/>
  <!-- arm left (resting) -->
  <rect x="28" y="80" width="11" height="26" rx="5" fill="#1e3a8a"/>
  <ellipse cx="28" cy="106" rx="7" ry="5" fill="#FFCBA4"/>
  <!-- arm right + briefcase -->
  <rect x="81" y="80" width="11" height="26" rx="5" fill="#1e3a8a"/>
  <rect x="82" y="108" width="24" height="18" rx="4" fill="#8B4513" stroke="#6B3410" stroke-width="1.5"/>
  <rect x="90" y="104" width="8" height="6" rx="2" fill="#6B3410"/>
  <line x1="82" y1="118" x2="106" y2="118" stroke="#6B3410" stroke-width="1.5"/>
  <!-- neck -->
  <rect x="54" y="66" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head -->
  <ellipse cx="60" cy="44" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="46" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <ellipse cx="79" cy="52" rx="8" ry="6" fill="#FF9999" opacity="0.38"/>
  <!-- smug half-lidded eyes -->
  <ellipse cx="48" cy="43" rx="6" ry="7" fill="#333"/>
  <ellipse cx="72" cy="43" rx="6" ry="7" fill="#333"/>
  <rect x="42" y="38" width="12" height="6" rx="2" fill="#FFCBA4"/>
  <rect x="66" y="38" width="12" height="6" rx="2" fill="#FFCBA4"/>
  <circle cx="51" cy="41" r="2" fill="white"/>
  <circle cx="75" cy="41" r="2" fill="white"/>
  <!-- smug slight smile -->
  <path d="M51 59 Q60 65 70 59" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`},
    // 6. 헤지펀드대표 — 달러 눈, 검은 프리미엄 슈트, 금화 떠다님
    { bg:"#f8a040", desc:"숏도 롱도 다 먹는다",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" width="105" height="118">
  <!-- floating gold coins -->
  <ellipse cx="15" cy="55" rx="10" ry="10" fill="#FFD700" stroke="#cc9900" stroke-width="1.5"/>
  <text x="15" y="59" font-size="10" fill="#aa7700" text-anchor="middle" font-weight="bold">$</text>
  <ellipse cx="105" cy="45" rx="10" ry="10" fill="#FFD700" stroke="#cc9900" stroke-width="1.5"/>
  <text x="105" y="49" font-size="10" fill="#aa7700" text-anchor="middle" font-weight="bold">$</text>
  <ellipse cx="108" cy="75" rx="8" ry="8" fill="#FFD700" stroke="#cc9900" stroke-width="1.5"/>
  <text x="108" y="79" font-size="9" fill="#aa7700" text-anchor="middle" font-weight="bold">$</text>
  <!-- legs -->
  <rect x="48" y="118" width="12" height="30" rx="5" fill="#111"/>
  <rect x="60" y="118" width="12" height="30" rx="5" fill="#111"/>
  <!-- premium dark suit body -->
  <rect x="32" y="84" width="56" height="42" rx="10" fill="#111"/>
  <!-- white shirt -->
  <rect x="51" y="84" width="18" height="42" fill="white"/>
  <!-- gold tie -->
  <polygon points="58,86 62,86 64,116 60,122 56,116" fill="#FFD700"/>
  <!-- suit lapels -->
  <polygon points="51,84 33,100 51,94" fill="#0a0a0a"/>
  <polygon points="69,84 87,100 69,94" fill="#0a0a0a"/>
  <!-- cufflinks -->
  <circle cx="34" cy="112" r="3" fill="#FFD700"/>
  <circle cx="86" cy="112" r="3" fill="#FFD700"/>
  <!-- arms -->
  <rect x="26" y="88" width="12" height="28" rx="5" fill="#111"/>
  <ellipse cx="27" cy="116" rx="7" ry="5" fill="#FFCBA4"/>
  <rect x="82" y="88" width="12" height="28" rx="5" fill="#111"/>
  <ellipse cx="93" cy="116" rx="7" ry="5" fill="#FFCBA4"/>
  <!-- neck -->
  <rect x="54" y="74" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- head -->
  <ellipse cx="60" cy="52" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="54" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="54" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks -->
  <ellipse cx="41" cy="60" rx="8" ry="6" fill="#FF9999" opacity="0.4"/>
  <ellipse cx="79" cy="60" rx="8" ry="6" fill="#FF9999" opacity="0.4"/>
  <!-- dollar sign eyes -->
  <ellipse cx="48" cy="48" rx="8" ry="8" fill="white" stroke="#333" stroke-width="1"/>
  <ellipse cx="72" cy="48" rx="8" ry="8" fill="white" stroke="#333" stroke-width="1"/>
  <text x="48" y="52" font-size="11" fill="#228B22" text-anchor="middle" font-weight="bold">$</text>
  <text x="72" y="52" font-size="11" fill="#228B22" text-anchor="middle" font-weight="bold">$</text>
  <!-- greedy grin -->
  <path d="M44 66 Q60 78 76 66" stroke="#333" stroke-width="2.5" fill="#cc5544" stroke-linecap="round"/>
  <!-- teeth -->
  <path d="M50 68 Q60 76 70 68" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`},
    // 7. 주식왕 — 황홀한 표정, 금왕관, 네이비 슈트+빨간 넥타이, 돈가방+스파클
    { bg:"#FFD700", desc:"시장이 나를 따른다",
      svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 175" width="108" height="130">
  <!-- sparkles around -->
  <text x="8" y="28" font-size="14" fill="#FFD700">✦</text>
  <text x="100" y="24" font-size="14" fill="#FFD700">✦</text>
  <text x="4" y="80" font-size="10" fill="#FFD700">✦</text>
  <text x="108" y="72" font-size="10" fill="#FFD700">✦</text>
  <!-- gold crown -->
  <polygon points="32,42 60,12 88,42 80,34 60,24 40,34" fill="#FFD700" stroke="#cc9900" stroke-width="1.5"/>
  <circle cx="60" cy="18" r="5" fill="#FF4444"/>
  <circle cx="38" cy="38" r="4" fill="#4444FF"/>
  <circle cx="82" cy="38" r="4" fill="#44AA44"/>
  <!-- head -->
  <ellipse cx="60" cy="60" rx="30" ry="28" fill="#FFCBA4"/>
  <!-- ears -->
  <ellipse cx="30" cy="62" rx="6" ry="8" fill="#F5B898"/>
  <ellipse cx="90" cy="62" rx="6" ry="8" fill="#F5B898"/>
  <!-- cheeks (extra rosy for king) -->
  <ellipse cx="41" cy="68" rx="9" ry="7" fill="#FF9999" opacity="0.5"/>
  <ellipse cx="79" cy="68" rx="9" ry="7" fill="#FF9999" opacity="0.5"/>
  <!-- blissful closed-curve eyes (^ ^) -->
  <path d="M42 56 Q48 49 54 56" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M66 56 Q72 49 78 56" stroke="#333" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- big happy smile -->
  <path d="M44 72 Q60 86 76 72" stroke="#333" stroke-width="2.5" fill="#ff8866" stroke-linecap="round"/>
  <path d="M50 75 Q60 83 70 75" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- neck -->
  <rect x="54" y="84" width="12" height="12" rx="4" fill="#FFCBA4"/>
  <!-- suit body (navy premium) -->
  <rect x="30" y="92" width="60" height="48" rx="10" fill="#1e3a8a"/>
  <!-- white shirt front -->
  <rect x="50" y="92" width="20" height="48" fill="white"/>
  <!-- red tie -->
  <polygon points="57,94 63,94 65,128 60,134 55,128" fill="#cc2222"/>
  <!-- suit lapels -->
  <polygon points="50,92 30,108 50,102" fill="#162d72"/>
  <polygon points="70,92 90,108 70,102" fill="#162d72"/>
  <!-- medal/pin on lapel -->
  <circle cx="42" cy="100" r="4" fill="#FFD700" stroke="#cc9900" stroke-width="1"/>
  <!-- arms -->
  <rect x="22" y="96" width="13" height="30" rx="6" fill="#1e3a8a"/>
  <ellipse cx="23" cy="126" rx="8" ry="6" fill="#FFCBA4"/>
  <rect x="85" y="96" width="13" height="30" rx="6" fill="#1e3a8a"/>
  <!-- money bag -->
  <ellipse cx="100" cy="130" rx="14" ry="16" fill="#FFD700" stroke="#cc9900" stroke-width="1.5"/>
  <text x="100" y="134" font-size="13" fill="#aa7700" text-anchor="middle" font-weight="bold">$</text>
  <ellipse cx="100" cy="114" rx="7" ry="5" fill="#cc9900"/>
  <!-- legs -->
  <rect x="46" y="136" width="12" height="28" rx="5" fill="#1e3a8a"/>
  <rect x="62" y="136" width="12" height="28" rx="5" fill="#1e3a8a"/>
  <!-- shoes -->
  <ellipse cx="52" cy="163" rx="10" ry="5" fill="#111"/>
  <ellipse cx="68" cy="163" rx="10" ry="5" fill="#111"/>
</svg>`},
  ];

  let charFigEl: HTMLElement | null = null;
  let charBubbleEl: HTMLElement | null = null;
  let charStageEl: HTMLElement | null = null;

  function buildDOM() {
    root.innerHTML = "";

    // ── Top stats bar (dark) ──
    const topbar = el("div", "topbar");
    const topLeft = el("div", "topbar-left");
    const coinIcon = el("span"); coinIcon.textContent = "💰";
    cashEl = el("div", "topbar-cash");
    topLeft.append(coinIcon, cashEl);

    const topRight = el("div", "topbar-right");
    rankEl  = el("span", "topbar-rank");
    totalEl = el("div", "topbar-total");
    topRight.append(rankEl, totalEl);
    topbar.append(topLeft, topRight);

    // ── Scene (tap area) ──
    const scene = el("div", "scene");
    scene.addEventListener("click", onTap);

    // Background NPC crowd (decorative, not clickable)
    const crowd = el("div", "scene-crowd");
    const npcs = [
      { cls:"npc npc-1", e:"🤑" }, { cls:"npc npc-2", e:"👨‍💻" },
      { cls:"npc npc-3", e:"👩‍💼" }, { cls:"npc npc-4", e:"📊" },
      { cls:"npc npc-5", e:"💹" }, { cls:"npc npc-6", e:"🏦" },
      { cls:"npc npc-7", e:"📈" }, { cls:"npc npc-8", e:"💼" },
    ];
    npcs.forEach(({ cls, e }) => {
      const s = el("span", cls); s.textContent = e;
      crowd.appendChild(s);
    });
    scene.appendChild(crowd);

    // Main character
    const charWrap = el("div", "char-wrap");
    charBubbleEl = el("div", "char-bubble");
    charBubbleEl.textContent = "+100원 / 탭";
    charFigEl = el("div", "char-fig");
    charStageEl = el("div", "char-stage");
    buildCharStage();
    charFigEl.appendChild(charStageEl);
    const charLabel = el("div", "char-label");
    charLabel.textContent = "탭!";
    charWrap.append(charBubbleEl, charFigEl, charLabel);
    scene.appendChild(charWrap);

    // ── Event box ──
    eventBoxEl = el("div", "event-box event-normal");
    eventBoxEl.textContent = "📊 시장이 열렸습니다. 투자를 시작하세요!";

    // ── Tab bar ──
    const tabBar = el("div", "tab-bar");
    [
      { id: "market",    icon: "📈", text: "시장" },
      { id: "portfolio", icon: "💼", text: "보유" },
      { id: "news",      icon: "📰", text: "뉴스" },
      { id: "upgrades",  icon: "⚙️", text: "샵"  },
    ].forEach(({ id, icon, text }) => {
      const btn = el("button", "tab-btn") as HTMLButtonElement;
      btn.innerHTML = `<span class="tab-icon">${icon}</span><span class="tab-text">${text}</span>`;
      btn.dataset.tab = id;
      btn.addEventListener("click", () => switchTab(id));
      tabBar.appendChild(btn);
    });

    tabContentEl = el("div", "tab-content");

    const stickyTop = el("div", "sticky-top");
    stickyTop.append(topbar, scene, eventBoxEl, tabBar);
    root.append(stickyTop, tabContentEl);
  }

  // ─── Character stage builder ────────────────────────────────────────────────

  function buildCharStage() {
    if (!charStageEl) return;
    const s = CHAR_STAGES[state.rankIdx];
    charStageEl.innerHTML = `
      <div class="cs-svg">${s.svg}</div>
      <div class="cs-desc">${s.desc}</div>
    `;
    const sceneEl = root.querySelector(".scene") as HTMLElement | null;
    if (sceneEl) {
      sceneEl.style.background =
        `linear-gradient(180deg, #87CEEB 0%, ${s.bg} 70%, #D4EFD8 100%)`;
    }
  }

  // ─── Header ─────────────────────────────────────────────────────────────────

  let prevRankIdx = -1;

  function renderHeader() {
    rankEl.textContent  = RANKS[state.rankIdx].name;
    cashEl.textContent  = fmt(state.cash);
    totalEl.textContent = `총자산 ${fmtShort(totalAssets())}`;
    if (charBubbleEl) charBubbleEl.textContent = `+${fmt(getTapAmount())} / 탭`;
    // Rebuild character only when rank changes
    if (state.rankIdx !== prevRankIdx) {
      prevRankIdx = state.rankIdx;
      buildCharStage();
    }
  }

  // ─── Tap ────────────────────────────────────────────────────────────────────

  function onTap(e: MouseEvent) {
    const amt = getTapAmount();
    state.cash += amt;
    checkRank();
    renderHeader();
    save();
    showFloat(e.clientX, e.clientY, `+${fmt(amt)}`);
    // Bounce animation on character
    if (charFigEl) {
      charFigEl.classList.add("tapped");
      setTimeout(() => charFigEl!.classList.remove("tapped"), 120);
    }
  }

  function showFloat(x: number, y: number, text: string) {
    const f = el("div", "float-text");
    f.textContent = text;
    f.style.left  = x + "px";
    f.style.top   = y + "px";
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
  }

  // ─── Event box ──────────────────────────────────────────────────────────────

  type EventType = "normal" | "profit" | "loss" | "rank" | "warning";

  function showEvent(msg: string, type: EventType = "normal") {
    // Don't override an active jakjeon warning with a lesser event
    if (isJakjeonActive && type !== "warning") return;
    if (eventClearTimer) clearTimeout(eventClearTimer);
    eventBoxEl.className = `event-box event-${type}`;
    eventBoxEl.textContent = msg;
    if (type !== "warning") {
      eventClearTimer = setTimeout(() => {
        eventBoxEl.className = "event-box event-normal";
        eventBoxEl.textContent = "📊 시장 현황을 확인하세요.";
      }, 4000);
    }
  }

  // ─── Tab switching ──────────────────────────────────────────────────────────

  function switchTab(tab: string) {
    activeTab = tab;
    root.querySelectorAll(".tab-btn").forEach((b) => {
      (b as HTMLElement).classList.toggle("active", (b as HTMLElement).dataset.tab === tab);
    });
    renderTab();
  }

  function renderTab() {
    tabContentEl.innerHTML = "";
    if (activeTab === "market")   renderMarket();
    else if (activeTab === "portfolio") renderPortfolio();
    else if (activeTab === "news")      renderNews();
    else                                renderUpgrades();
  }

  // ─── Market ─────────────────────────────────────────────────────────────────

  function renderMarket() {
    tabContentEl.innerHTML = "";
    const wrap = el("div", "market-wrap");

    const replBtn = el("button", "repl-btn") as HTMLButtonElement;
    replBtn.textContent = "🔀 종목 교체";
    replBtn.addEventListener("click", replaceStocks);
    wrap.appendChild(replBtn);

    state.stocks.forEach((s, i) => wrap.appendChild(buildCard(s, i)));
    tabContentEl.appendChild(wrap);
  }

  function buildCard(s: StockState, i: number) {
    const card = el("div", "stock-card");
    if (isJakjeonActive && i === jakjeonTargetIdx) card.classList.add("jakjeon-target");

    // Summary row
    const summary = el("div", "sr-summary");
    summary.dataset.stockIndex = String(i);

    const nameEl  = el("span", "s-name");  nameEl.textContent = s.name;
    const heldEl  = el("span", "s-held");  heldEl.textContent = s.held > 0 ? `${s.held}주 보유` : "";

    const priceEl = el("span", "s-price");
    priceEl.dataset.price = String(i);
    priceEl.textContent = fmt(s.price);

    const arrow = s.pctChange >= 0 ? "▲" : "▼";
    const pctEl = el("span", `s-pct ${s.pctChange >= 0 ? "up" : "dn"}`);
    pctEl.dataset.pct = String(i);
    pctEl.textContent = arrow + fmtP(s.pctChange);

    summary.append(nameEl, heldEl, priceEl, pctEl);
    summary.addEventListener("click", () => toggleRow(i));
    card.appendChild(summary);

    if (openIdx === i) card.appendChild(buildPanel(s, i));
    return card;
  }

  function buildPanel(s: StockState, i: number) {
    const panel = el("div", "trade-panel");

    // ── Buy ──
    const buySection = el("div", "trade-section");
    const buyLabel   = el("div", "trade-label up"); buyLabel.textContent = "매수";
    const buyRow     = el("div", "trade-row");

    const buyInput = el("input", "qty-input") as HTMLInputElement;
    buyInput.type  = "number"; buyInput.min = "1"; buyInput.value = "1";

    const maxBuy    = Math.floor(state.cash / s.price);
    const buyAllBtn = el("button", "all-btn buy-all") as HTMLButtonElement;
    buyAllBtn.textContent = "전량";
    if (maxBuy < 1) buyAllBtn.disabled = true;
    buyAllBtn.addEventListener("click", () => { buyInput.value = String(maxBuy); });

    const buyBtn = el("button", "trade-btn buy-btn") as HTMLButtonElement;
    buyBtn.textContent = "매수";
    buyBtn.addEventListener("click", () => doBuy(i, parseInt(buyInput.value) || 0));

    buyRow.append(buyInput, buyAllBtn, buyBtn);
    buySection.append(buyLabel, buyRow);

    // ── Sell ──
    const sellSection = el("div", "trade-section");
    const sellLabel   = el("div", "trade-label dn"); sellLabel.textContent = "매도";
    const sellRow     = el("div", "trade-row");

    const sellInput = el("input", "qty-input") as HTMLInputElement;
    sellInput.type  = "number"; sellInput.min = "1"; sellInput.value = "1";

    const sellAllBtn = el("button", "all-btn sell-all") as HTMLButtonElement;
    sellAllBtn.textContent = "전량";
    sellAllBtn.addEventListener("click", () => { sellInput.value = String(s.held); });

    const sellBtn = el("button", "trade-btn sell-btn") as HTMLButtonElement;
    sellBtn.textContent = "매도";
    sellBtn.addEventListener("click", () => doSell(i, parseInt(sellInput.value) || 0));

    sellRow.append(sellInput, sellAllBtn, sellBtn);

    // ── Avg info ──
    const avgInfo = el("div", "avg-info");
    avgInfo.dataset.avgInfo = String(i);
    if (s.held > 0) {
      const avg    = s.totalCost / s.held;
      const profit = (s.price - avg) * s.held;
      const pct    = ((s.price - avg) / avg) * 100;
      const cls    = profit >= 0 ? "up" : "dn";
      avgInfo.innerHTML =
        `평균단가 ${fmt(avg)} | 평가손익 <span class="${cls}">${profit >= 0 ? "+" : ""}${fmt(profit)} (${fmtP(pct)})</span>`;
    } else {
      avgInfo.textContent = "보유 없음";
    }

    sellSection.append(sellLabel, sellRow, avgInfo);
    panel.append(buySection, sellSection);
    return panel;
  }

  // ── toggleRow: only called by sr-summary click ──
  function toggleRow(i: number) {
    if (isJakjeonActive && i === jakjeonTargetIdx) {
      handleJakjeonSuccess();
      return;
    }
    openIdx = openIdx === i ? null : i;
    renderMarket();
  }

  // ─── Partial price patch (no full re-render) ─────────────────────────────────

  function patchPrices() {
    state.stocks.forEach((s, i) => {
      const priceEl = root.querySelector(`[data-price="${i}"]`) as HTMLElement | null;
      const pctEl   = root.querySelector(`[data-pct="${i}"]`)   as HTMLElement | null;
      if (priceEl) priceEl.textContent = fmt(s.price);
      if (pctEl) {
        const arrow = s.pctChange >= 0 ? "▲" : "▼";
        pctEl.textContent = arrow + fmtP(s.pctChange);
        pctEl.className   = `s-pct ${s.pctChange >= 0 ? "up" : "dn"}`;
      }
      // Real-time avg-info (평가손익) in market tab
      const avgInfo = root.querySelector(`[data-avg-info="${i}"]`) as HTMLElement | null;
      if (avgInfo) {
        if (s.held > 0) {
          const avg    = s.totalCost / s.held;
          const profit = (s.price - avg) * s.held;
          const pct    = ((s.price - avg) / avg) * 100;
          const cls    = profit >= 0 ? "up" : "dn";
          avgInfo.innerHTML = `평균단가 ${fmt(avg)} | 평가손익 <span class="${cls}">${profit >= 0 ? "+" : ""}${fmt(profit)} (${fmtP(pct)})</span>`;
        } else {
          avgInfo.textContent = "보유 없음";
        }
      }
      // Sync jakjeon highlight
      const summary = root.querySelector(`[data-stock-index="${i}"]`);
      if (summary) {
        const card = summary.closest(".stock-card");
        if (card) {
          card.classList.toggle("jakjeon-target", isJakjeonActive && i === jakjeonTargetIdx);
        }
      }
    });
  }

  // ─── Buy / Sell ─────────────────────────────────────────────────────────────

  function doBuy(i: number, qty: number) {
    if (qty <= 0) return;
    const s    = state.stocks[i];
    const cost = s.price * qty;
    if (cost > state.cash) { showEvent("💸 현금이 부족합니다!", "loss"); return; }
    state.cash     -= cost;
    s.held         += qty;
    s.totalCost    += cost;
    addNews(`📈 ${s.name} ${qty}주 매수 @ ${fmt(s.price)}`);
    checkRank(); renderHeader(); renderMarket(); save();
  }

  function doSell(i: number, qty: number) {
    if (qty <= 0) return;
    const s = state.stocks[i];
    if (qty > s.held) { showEvent("📦 보유 수량이 부족합니다!", "loss"); return; }
    const avg     = s.totalCost / s.held;
    const profit  = (s.price - avg) * qty;
    state.cash   += s.price * qty;
    s.held       -= qty;
    s.totalCost  -= avg * qty;
    if (s.held === 0) s.totalCost = 0;
    const type = profit >= 0 ? "profit" : "loss";
    addNews(`📉 ${s.name} ${qty}주 매도 @ ${fmt(s.price)} (${profit >= 0 ? "+" : ""}${fmt(profit)})`);
    showEvent(`${profit >= 0 ? "💰" : "😢"} ${s.name} 매도! ${profit >= 0 ? "+" : ""}${fmt(profit)}`, type);
    checkRank(); renderHeader(); renderMarket(); save();
  }

  // ─── Replace stocks ─────────────────────────────────────────────────────────

  function replaceStocks() {
    const heldPool    = new Set(state.stocks.filter((s) => s.held > 0).map((s) => s.poolIdx));
    const currentPool = new Set(state.stocks.map((s) => s.poolIdx));
    const available   = shuffle(
      POOL.map((_, i) => i).filter((i) => !heldPool.has(i) && !currentPool.has(i))
    );
    let ri = 0;
    state.stocks = state.stocks.map((s) => {
      if (s.held > 0) return s;
      if (ri >= available.length) return s;
      const pi = available[ri++];
      return {
        poolIdx: pi, name: POOL[pi].name, basePrice: POOL[pi].basePrice,
        sector: POOL[pi].sector, price: POOL[pi].basePrice,
        pctChange: 0, held: 0, totalCost: 0,
      };
    });
    openIdx = null;
    renderMarket();
    save();
  }

  // ─── Portfolio ──────────────────────────────────────────────────────────────

  function renderPortfolio() {
    tabContentEl.innerHTML = "";
    const wrap      = el("div", "port-wrap");
    const total     = totalAssets();
    const stockVal  = state.stocks.reduce((s, x) => s + x.held * x.price, 0);
    const summary   = el("div", "port-summary");
    summary.dataset.portSummary = "1";
    summary.innerHTML = `
      <div class="port-row"><span>총자산</span><span class="bold" data-port="total">${fmtShort(total)}</span></div>
      <div class="port-row"><span>현금</span><span data-port="cash">${fmt(state.cash)}</span></div>
      <div class="port-row"><span>주식 평가액</span><span data-port="stockval">${fmtShort(stockVal)}</span></div>
    `;
    wrap.appendChild(summary);
    const held = state.stocks.filter((s) => s.held > 0);
    if (!held.length) {
      const empty = el("div", "empty-msg"); empty.textContent = "보유 주식이 없습니다.";
      wrap.appendChild(empty);
    } else {
      held.forEach((s, cardIdx) => {
        const avg    = s.totalCost / s.held;
        const profit = (s.price - avg) * s.held;
        const pct    = ((s.price - avg) / avg) * 100;
        const card   = el("div", "port-card");
        card.dataset.portIdx = String(cardIdx);
        card.innerHTML = `
          <div class="port-stock-name">${s.name}</div>
          <div class="port-row"><span>${s.held}주</span><span data-port-price="${cardIdx}">현재가 ${fmt(s.price)}</span></div>
          <div class="port-row"><span>평균단가 ${fmt(avg)}</span>
            <span class="${profit >= 0 ? "up" : "dn"}" data-port-profit="${cardIdx}">${profit >= 0 ? "+" : ""}${fmt(profit)} (${fmtP(pct)})</span></div>
          <div class="port-row"><span>평가액</span><span data-port-val="${cardIdx}">${fmt(s.held * s.price)}</span></div>
        `;
        wrap.appendChild(card);
      });
    }
    tabContentEl.appendChild(wrap);
  }

  function patchPortfolio() {
    if (activeTab !== "portfolio") return;
    const total    = totalAssets();
    const stockVal = state.stocks.reduce((s, x) => s + x.held * x.price, 0);
    const tEl = tabContentEl.querySelector('[data-port="total"]') as HTMLElement | null;
    const cEl = tabContentEl.querySelector('[data-port="cash"]')  as HTMLElement | null;
    const vEl = tabContentEl.querySelector('[data-port="stockval"]') as HTMLElement | null;
    if (tEl) tEl.textContent = fmtShort(total);
    if (cEl) cEl.textContent = fmt(state.cash);
    if (vEl) vEl.textContent = fmtShort(stockVal);

    const held = state.stocks.filter((s) => s.held > 0);
    held.forEach((s, cardIdx) => {
      const avg    = s.totalCost / s.held;
      const profit = (s.price - avg) * s.held;
      const pct    = ((s.price - avg) / avg) * 100;
      const priceEl  = tabContentEl.querySelector(`[data-port-price="${cardIdx}"]`)  as HTMLElement | null;
      const profitEl = tabContentEl.querySelector(`[data-port-profit="${cardIdx}"]`) as HTMLElement | null;
      const valEl    = tabContentEl.querySelector(`[data-port-val="${cardIdx}"]`)    as HTMLElement | null;
      if (priceEl)  priceEl.textContent  = `현재가 ${fmt(s.price)}`;
      if (profitEl) {
        profitEl.textContent = `${profit >= 0 ? "+" : ""}${fmt(profit)} (${fmtP(pct)})`;
        profitEl.className   = profit >= 0 ? "up" : "dn";
      }
      if (valEl) valEl.textContent = fmt(s.held * s.price);
    });
  }

  // ─── News ───────────────────────────────────────────────────────────────────

  function renderNews() {
    tabContentEl.innerHTML = "";
    const wrap = el("div", "news-wrap");
    state.news.forEach((n) => {
      const item = el("div", "news-item"); item.textContent = n;
      wrap.appendChild(item);
    });
    tabContentEl.appendChild(wrap);
  }

  // ─── Upgrades ───────────────────────────────────────────────────────────────

  function renderUpgrades() {
    tabContentEl.innerHTML = "";
    const wrap = el("div", "upg-wrap");
    UPGRADES.forEach((u) => {
      const owned  = state.purchasedUpgrades.includes(u.id);
      const card   = el("div", `upg-card${owned ? " owned" : ""}`);
      card.innerHTML = `
        <div class="upg-name">${u.name}</div>
        <div class="upg-desc">${u.desc}</div>
        <div class="upg-cost">${owned ? "✅ 보유중" : fmt(u.cost)}</div>
      `;
      if (!owned) {
        const btn = el("button", "upg-btn") as HTMLButtonElement;
        btn.textContent = "구매";
        btn.disabled    = state.cash < u.cost;
        btn.addEventListener("click", () => buyUpgrade(u.id));
        card.appendChild(btn);
      }
      wrap.appendChild(card);
    });
    tabContentEl.appendChild(wrap);
  }

  function buyUpgrade(id: string) {
    const u = UPGRADES.find((x) => x.id === id)!;
    if (state.purchasedUpgrades.includes(id) || state.cash < u.cost) return;
    state.cash -= u.cost;
    state.purchasedUpgrades.push(id);
    addNews(`⚙️ ${u.name} 구매 완료!`);
    showEvent(`⚙️ ${u.name} 구매!`, "profit");
    if (id === "bot") startBot();
    renderHeader(); renderUpgrades(); save();
  }

  // ─── Auto bot ───────────────────────────────────────────────────────────────

  let botTimer: ReturnType<typeof setInterval> | null = null;
  function startBot() {
    if (botTimer) return;
    const bot = UPGRADES.find((u) => u.id === "bot")!;
    botTimer = setInterval(() => {
      state.cash += bot.autoCash;
      renderHeader();
    }, 3000);
  }

  // ─── Price tick (no renderMarket!) ──────────────────────────────────────────

  function tickPrices() {
    state.stocks.forEach((s) => {
      const delta = (Math.random() - 0.48) * 0.03;
      s.price     = Math.max(s.basePrice * 0.3, s.price * (1 + delta));
      s.pctChange = ((s.price - s.basePrice) / s.basePrice) * 100;
    });
    patchPrices();
    patchPortfolio();
    renderHeader();
    save();
  }

  // ─── Sector / stock events ──────────────────────────────────────────────────

  function triggerEvent() {
    if (Math.random() < 0.5) {
      const ev  = SECTOR_EVENTS[Math.floor(Math.random() * SECTOR_EVENTS.length)];
      state.stocks.forEach((s) => { if (s.sector === ev.sector) s.price *= ev.mult; });
      const type = ev.mult >= 1 ? "profit" : "loss";
      const icon = ev.mult >= 1 ? "📈" : "📉";
      showEvent(`${icon} [${ev.sector}] ${ev.msg}`, type);
      addNews(`${icon} [섹터이벤트] ${ev.msg}`);
    } else {
      const i    = Math.floor(Math.random() * state.stocks.length);
      const s    = state.stocks[i];
      const good = Math.random() < 0.5;
      const mult = good ? 1 + Math.random() * 0.1 : 1 - Math.random() * 0.1;
      s.price   *= mult;
      s.pctChange = ((s.price - s.basePrice) / s.basePrice) * 100;
      const pct  = ((mult - 1) * 100).toFixed(1);
      const type: EventType = good ? "profit" : "loss";
      const icon = good ? "🚀" : "💥";
      const suffix = good ? `급등! (+${pct}%)` : `급락... (${pct}%)`;
      showEvent(`${icon} ${s.name} ${suffix}`, type);
      addNews(`${icon} [개별이벤트] ${s.name} ${suffix}`);
    }
    patchPrices();
    renderHeader();
  }

  // ─── Jakjeon (작전세력) ──────────────────────────────────────────────────────

  function scheduleJakjeon() {
    const delay = (Math.random() * 60 + 120) * 1000; // 120~180s
    jakjeonNextTimer = setTimeout(() => {
      const candidates = state.stocks
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.held === 0)
        .map(({ i }) => i);
      if (candidates.length > 0) {
        startJakjeon(candidates[Math.floor(Math.random() * candidates.length)]);
      } else {
        scheduleJakjeon(); // no unowned stock → retry
      }
    }, delay);
  }

  function startJakjeon(idx: number) {
    isJakjeonActive   = true;
    jakjeonTargetIdx  = idx;
    const name        = state.stocks[idx].name;
    patchPrices(); // immediately show blink highlight

    let countdown = 5;
    setJakjeonEventText(name, countdown);

    jakjeonCountdownTimer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(jakjeonCountdownTimer!);
        jakjeonCountdownTimer = null;
        handleJakjeonFail();
      } else {
        setJakjeonEventText(name, countdown);
      }
    }, 1000);
  }

  function setJakjeonEventText(name: string, sec: number) {
    eventBoxEl.className   = "event-box event-warning";
    eventBoxEl.textContent = `🚨 작전세력! ${name} 탭! (${sec}초...)`;
    if (eventClearTimer) { clearTimeout(eventClearTimer); eventClearTimer = null; }
  }

  function handleJakjeonSuccess() {
    if (!isJakjeonActive) return;
    clearInterval(jakjeonCountdownTimer!);
    jakjeonCountdownTimer = null;

    const s     = state.stocks[jakjeonTargetIdx];
    s.price    *= 1.2;
    s.pctChange = ((s.price - s.basePrice) / s.basePrice) * 100;

    const name        = s.name;
    isJakjeonActive   = false;
    jakjeonTargetIdx  = -1;

    showEvent(`🎯 작전세력 편승 성공! ${name} +20%!`, "profit");
    addNews(`🎯 [작전세력] ${name} 편승 성공! +20%`);
    patchPrices();

    // next: 150~210s
    jakjeonNextTimer = setTimeout(() => tryScheduleJakjeon(), (Math.random() * 60 + 150) * 1000);
  }

  function handleJakjeonFail() {
    const s     = state.stocks[jakjeonTargetIdx];
    s.price    *= 0.95;
    s.pctChange = ((s.price - s.basePrice) / s.basePrice) * 100;

    const name        = s.name;
    isJakjeonActive   = false;
    jakjeonTargetIdx  = -1;

    showEvent("😢 놓쳤다... 작전세력이 혼자 먹고 튀었어요", "loss");
    addNews(`😢 [작전세력] ${name} 실패... -5%`);
    patchPrices();

    // next: 90~120s (sooner retry)
    jakjeonNextTimer = setTimeout(() => tryScheduleJakjeon(), (Math.random() * 30 + 90) * 1000);
  }

  function tryScheduleJakjeon() {
    const candidates = state.stocks
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.held === 0)
      .map(({ i }) => i);
    if (candidates.length > 0) {
      startJakjeon(candidates[Math.floor(Math.random() * candidates.length)]);
    } else {
      scheduleJakjeon();
    }
  }

  // ─── Bootstrap ──────────────────────────────────────────────────────────────

  state = load() || defaultState();
  buildDOM();
  renderHeader();
  switchTab("market");

  if (state.purchasedUpgrades.includes("bot")) startBot();

  setInterval(tickPrices, 2000);
  setInterval(triggerEvent, 9000);
  scheduleJakjeon();
}
