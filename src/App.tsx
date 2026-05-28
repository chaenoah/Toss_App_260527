import { useState, useEffect, useCallback } from "react";
import "./App.css";

/* ── Types ── */
type InvestType = "domestic" | "overseas" | "bigcoin" | "altcoin";
type Severity   = "safe" | "mild" | "bad" | "dead";
type ViewMode   = "form" | "my-result" | "shared-result";

const VALID_TYPES: InvestType[] = ["domestic", "overseas", "bigcoin", "altcoin"];

const CHIPS: { value: InvestType; label: string; danger?: boolean }[] = [
  { value: "domestic", label: "국내 대형주" },
  { value: "overseas", label: "해외 주식"  },
  { value: "bigcoin",  label: "대형 코인"  },
  { value: "altcoin",  label: "잡코인 🎰", danger: true },
];

const TYPE_LABEL: Record<InvestType, string> = {
  domestic: "국내 대형주",
  overseas: "해외 주식",
  bigcoin:  "대형 코인",
  altcoin:  "잡코인",
};

const SEV_COLOR: Record<Severity, string> = {
  safe: "#30D158",
  mild: "#FFD60A",
  bad:  "#FF9F0A",
  dead: "#FF453A",
};

interface Result {
  emoji:    string;
  time:     string;
  rawTime:  string;
  temp:     string;
  comment:  string;
  severity: Severity;
  meter:    number;   // 0-100
}

/* ── Logic ── */
function compute(rate: number, type: InvestType): Result {
  const alt = type === "altcoin";

  if (rate >= -10) return {
    emoji: "✅", severity: "safe", meter: 5,
    time:    "구조대 도착 완료 (0일)", rawTime: "0일",
    temp:    "14°C · 발만 담그기 가능",
    comment: "이미 구조되셨거나 경미한 타격입니다. 한강 갈 생각 마시고 본업에 집중하세요!",
  };

  if (rate >= -30) return {
    emoji: "🥶", severity: "mild", meter: 35,
    time:    alt ? "구조대 도착까지 3년" : "구조대 도착까지 1년 6개월",
    rawTime: alt ? "3년" : "1년 6개월",
    temp:    "18°C · 입수 금지, 추움",
    comment: "지금 한강 물 차갑습니다. 주식 창 꺼두시고 헬스장 가서 하체 운동이나 하면서 멘탈 잡으세요.",
  };

  if (rate >= -50) return {
    emoji: "😱", severity: "bad", meter: 70,
    time:    alt ? "구조대 도착까지 7년 4개월" : "구조대 도착까지 3년 8개월",
    rawTime: alt ? "7년 4개월" : "3년 8개월",
    temp:    "21°C · 수영하기 딱 좋은 온도",
    comment: "수익률이 아찔하네요. 한강 갈 생각은 접으시고, 당분간 출근해서 회사 비품이랑 탕비실 커피로 소소하게 횡령하면서 멘탈 치료하세요.",
  };

  return {
    emoji: "💀", severity: "dead", meter: 100,
    time:    alt ? "구조대 도착까지 198년" : "구조대 도착까지 99년",
    rawTime: alt ? "198년" : "99년",
    temp:    "24°C · 미온수, 따뜻함",
    comment: "이번 생에 탈출은 글렀습니다. 한강 물은 따뜻하지만 절대 가시면 안 됩니다! 직장에서 가성비 200%로 루팡하면서 숨만 쉬고 버티세요.",
  };
}

function buildUrl(rate: string, type: InvestType) {
  return `${location.origin}${location.pathname}?rate=${encodeURIComponent(rate)}&type=${encodeURIComponent(type)}`;
}

/* ── ResultCard (shared component) ── */
interface CardProps {
  result:   Result;
  type:     InvestType;
  shared?:  boolean;
  onShare:  () => void;
}
function ResultCard({ result, type, shared, onShare }: CardProps) {
  const color = SEV_COLOR[result.severity];
  const showBadge = type === "altcoin" && result.rawTime !== "0일";

  return (
    <div
      className={`result-card sev-${result.severity}`}
      style={{ "--sev": color } as React.CSSProperties}
    >
      {shared && <div className="shared-tag">🔗 친구가 공유한 결과예요</div>}

      <div className="card-top">
        <span className="card-emoji">{result.emoji}</span>
        <div className="card-meta">
          <div className="card-time">
            {result.time}
            {showBadge && <span className="badge">잡코인 ×2</span>}
          </div>
          <div className="card-temp">🌡 한강 수온: {result.temp}</div>
        </div>
      </div>

      {/* Damage meter */}
      <div className="meter-wrap">
        <div className="meter-track">
          <div
            className={`meter-fill${result.severity === "dead" ? " pulse" : ""}`}
            style={{ width: `${result.meter}%`, background: color }}
          />
        </div>
        <span className="meter-label">대미지 {result.meter}%</span>
      </div>

      <div className="card-divider" />
      <p className="card-comment">{result.comment}</p>

      <button className="share-btn" onClick={onShare}>
        <span>📤</span> 친구한테 공유하기
      </button>
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [rate,     setRate]     = useState("");
  const [type,     setType]     = useState<InvestType>("domestic");
  const [result,   setResult]   = useState<Result | null>(null);
  const [error,    setError]    = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [toast,    setToast]    = useState("");
  const [toastTmr, setToastTmr] = useState<ReturnType<typeof setTimeout>|null>(null);

  /* URL 파라미터로 진입 → 공유 결과 뷰 */
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const r = p.get("rate");
    const t = p.get("type") as InvestType | null;
    if (r && !isNaN(parseFloat(r))) {
      const n = parseFloat(r);
      const v = t && VALID_TYPES.includes(t) ? t : "domestic";
      setRate(r); setType(v);
      setResult(compute(n, v));
      setViewMode("shared-result");
    }
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTmr) clearTimeout(toastTmr);
    setToastTmr(setTimeout(() => setToast(""), 2500));
  }

  function handleCheck() {
    const n = parseFloat(rate);
    if (!rate.trim() || isNaN(n)) {
      setError("수익률을 숫자로 입력해주세요.");
      return;
    }
    setError("");
    setResult(compute(n, type));
    setViewMode("my-result");
  }

  /* "나도 해보기" — 공유 뷰 → 폼 뷰 */
  function handleTryMine() {
    setRate(""); setType("domestic"); setResult(null); setError("");
    setViewMode("form");
    history.replaceState({}, "", location.pathname);
  }

  const handleShare = useCallback(async () => {
    if (!result) return;
    const url  = buildUrl(rate, type);
    const text = `나 수익률 ${rate}%야 (${TYPE_LABEL[type]})\n${result.time}\n🌡 한강 수온: ${result.temp}\n\n너는 어때? 한강 탈출 예정일 확인해봐 👇`;
    if (typeof navigator.share === "function") {
      try { await navigator.share({ title: "한강 수온 주식 구조대 🌊", text, url }); }
      catch { /* 취소 */ }
    } else {
      try { await navigator.clipboard.writeText(url); showToast("🔗 링크가 복사됐어요!"); }
      catch { showToast("링크: " + url); }
    }
  }, [result, rate, type]);

  /* ── 공유 링크 진입 뷰 ── */
  if (viewMode === "shared-result" && result) {
    return (
      <div className="app shared-view">
        <div className="sv-header">
          <p className="sv-from">🌊 한강 수온 주식 구조대</p>
          <h1 className="sv-title">친구의 결과를<br />확인해보세요</h1>
        </div>

        <ResultCard result={result} type={type} shared onShare={handleShare} />

        <button className="cta try-btn" onClick={handleTryMine}>
          나도 내 수익률 확인해보기 →
        </button>

        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  /* ── 기본 / 결과 뷰 ── */
  return (
    <div className="app">
      <div className="header">
        <h1 className="title">한강 수온 주식 구조대 🌊</h1>
        <p className="subtitle">당신의 탈출 예정일을 알려드립니다</p>
      </div>

      <div className="form">
        <div>
          <span className="label">현재 내 수익률</span>
          <div className="input-row">
            <input
              className="rate-input"
              type="number"
              inputMode="decimal"
              placeholder="-30"
              value={rate}
              onChange={(e) => { setRate(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
            <span className="pct">%</span>
          </div>
          {error && <p className="error-msg">{error}</p>}
        </div>

        <div>
          <span className="label">투자 종목</span>
          <div className="chips">
            {CHIPS.map((c) => (
              <button
                key={c.value}
                className={[
                  "chip",
                  type === c.value && "active",
                  c.danger && type === c.value && "danger-chip",
                ].filter(Boolean).join(" ")}
                onClick={() => { setType(c.value); setResult(null); setViewMode("form"); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="cta" onClick={handleCheck}>
        내 구조대 도착 시간 확인
      </button>

      {result && viewMode === "my-result" && (
        <ResultCard result={result} type={type} onShare={handleShare} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
