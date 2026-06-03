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
  { id: "hts",     name: "HTS 설치",       desc: "탭 수익 2배",        cost: 5000,    tapMult: 2,  autoCash: 0   },
  { id: "book",    name: "투자 서적 정독", desc: "탭 수익 3배",        cost: 20000,   tapMult: 3,  autoCash: 0   },
  { id: "report",  name: "증권사 리포트",  desc: "탭 수익 5배",        cost: 80000,   tapMult: 5,  autoCash: 0   },
  { id: "algo",    name: "알고리즘 분석기",desc: "탭 수익 8배",        cost: 300000,  tapMult: 8,  autoCash: 0   },
  { id: "bot",     name: "AI 트레이딩 봇", desc: "3초마다 자동 수익",  cost: 800000,  tapMult: 0,  autoCash: 500 },
  { id: "insider", name: "내부정보 입수",  desc: "탭 수익 15배",       cost: 3000000, tapMult: 15, autoCash: 0   },
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
      cash: 0,
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
    return 100 * (mults.length ? Math.max(...mults) : 1);
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

  function buildDOM() {
    root.innerHTML = "";

    // Header
    const header = el("div", "header");
    rankEl  = el("span", "rank-badge");
    cashEl  = el("div", "cash-display");
    totalEl = el("div", "total-display");
    header.append(rankEl, cashEl, totalEl);

    // Character
    const charArea = el("div", "char-area");
    const charBtn  = el("button", "char-btn") as HTMLButtonElement;
    charBtn.textContent = "💰";
    charBtn.addEventListener("click", onTap);
    const tapHint = el("div", "tap-hint");
    tapHint.textContent = "탭해서 현금 획득!";
    charArea.append(charBtn, tapHint);

    // Event box
    eventBoxEl = el("div", "event-box event-normal");
    eventBoxEl.textContent = "📊 시장이 열렸습니다. 투자를 시작하세요!";

    // Tab bar
    const tabBar = el("div", "tab-bar");
    [
      { id: "market",   label: "📈 시장" },
      { id: "portfolio",label: "💼 보유" },
      { id: "news",     label: "📰 뉴스" },
      { id: "upgrades", label: "⚙️ 업그레이드" },
    ].forEach(({ id, label }) => {
      const btn = el("button", "tab-btn") as HTMLButtonElement;
      btn.textContent = label;
      btn.dataset.tab = id;
      btn.addEventListener("click", () => switchTab(id));
      tabBar.appendChild(btn);
    });

    // Content area
    tabContentEl = el("div", "tab-content");

    root.append(header, charArea, eventBoxEl, tabBar, tabContentEl);
  }

  // ─── Header ─────────────────────────────────────────────────────────────────

  function renderHeader() {
    rankEl.textContent  = RANKS[state.rankIdx].name;
    cashEl.textContent  = `현금 ${fmt(state.cash)}`;
    totalEl.textContent = `총자산 ${fmtShort(totalAssets())}`;
  }

  // ─── Tap ────────────────────────────────────────────────────────────────────

  function onTap(e: MouseEvent) {
    const amt = getTapAmount();
    state.cash += amt;
    checkRank();
    renderHeader();
    save();
    showFloat(e.clientX, e.clientY, `+${fmt(amt)}`);
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
    summary.innerHTML = `
      <div class="port-row"><span>총자산</span><span class="bold">${fmtShort(total)}</span></div>
      <div class="port-row"><span>현금</span><span>${fmt(state.cash)}</span></div>
      <div class="port-row"><span>주식 평가액</span><span>${fmtShort(stockVal)}</span></div>
    `;
    wrap.appendChild(summary);
    const held = state.stocks.filter((s) => s.held > 0);
    if (!held.length) {
      const empty = el("div", "empty-msg"); empty.textContent = "보유 주식이 없습니다.";
      wrap.appendChild(empty);
    } else {
      held.forEach((s) => {
        const avg    = s.totalCost / s.held;
        const profit = (s.price - avg) * s.held;
        const pct    = ((s.price - avg) / avg) * 100;
        const card   = el("div", "port-card");
        card.innerHTML = `
          <div class="port-stock-name">${s.name}</div>
          <div class="port-row"><span>${s.held}주</span><span>현재가 ${fmt(s.price)}</span></div>
          <div class="port-row"><span>평균단가 ${fmt(avg)}</span>
            <span class="${profit >= 0 ? "up" : "dn"}">${profit >= 0 ? "+" : ""}${fmt(profit)} (${fmtP(pct)})</span></div>
          <div class="port-row"><span>평가액</span><span>${fmt(s.held * s.price)}</span></div>
        `;
        wrap.appendChild(card);
      });
    }
    tabContentEl.appendChild(wrap);
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
    if (activeTab === "portfolio") renderPortfolio();
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
