import { useState } from "react";
import "./App.css";

type InvestType = "domestic" | "overseas" | "bigcoin" | "altcoin";

const CHIPS: { value: InvestType; label: string; danger?: boolean }[] = [
  { value: "domestic", label: "국내 대형주" },
  { value: "overseas", label: "해외 주식" },
  { value: "bigcoin", label: "대형 코인" },
  { value: "altcoin", label: "잡코인 🎰", danger: true },
];

interface Result {
  emoji: string;
  time: string;
  rawTime: string;
  temp: string;
  comment: string;
  isRed: boolean;
}

function compute(rate: number, type: InvestType): Result {
  const doubled = type === "altcoin";

  if (rate >= -10) {
    return {
      emoji: "✅",
      time: "구조대 도착 완료 (0일)",
      rawTime: "0일",
      temp: "14°C  발만 담그기 가능",
      comment:
        "이미 구조되셨거나 경미한 타격입니다. 한강 갈 생각 마시고 본업에 집중하세요!",
      isRed: false,
    };
  }

  if (rate >= -30) {
    return {
      emoji: "🥶",
      time: doubled ? "구조대 도착까지 3년" : "구조대 도착까지 1년 6개월",
      rawTime: doubled ? "3년" : "1년 6개월",
      temp: "18°C  입수 금지, 추움",
      comment:
        "지금 한강 물 차갑습니다. 주식 창 꺼두시고 헬스장 가서 하체 운동이나 하면서 멘탈 잡으세요.",
      isRed: false,
    };
  }

  if (rate >= -50) {
    return {
      emoji: "😱",
      time: doubled ? "구조대 도착까지 7년 4개월" : "구조대 도착까지 3년 8개월",
      rawTime: doubled ? "7년 4개월" : "3년 8개월",
      temp: "21°C  수영하기 딱 좋은 온도",
      comment:
        "수익률이 아찔하네요. 한강 갈 생각은 접으시고, 당분간 출근해서 회사 비품이랑 탕비실 커피로 소소하게 횡령하면서 멘탈 치료하세요.",
      isRed: false,
    };
  }

  return {
    emoji: "💀",
    time: doubled ? "구조대 도착까지 198년" : "구조대 도착까지 99년",
    rawTime: doubled ? "198년" : "99년",
    temp: "24°C  미온수, 따뜻함",
    comment:
      "이번 생에 탈출은 글렀습니다. 한강 물은 따뜻하지만 절대 가시면 안 됩니다! 직장에서 가성비 200%로 루팡하면서 숨만 쉬고 버티세요.",
    isRed: true,
  };
}

export default function App() {
  const [rate, setRate] = useState("");
  const [type, setType] = useState<InvestType>("domestic");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  function handleCheck() {
    const parsed = parseFloat(rate);
    if (rate.trim() === "" || isNaN(parsed)) {
      setError("수익률을 숫자로 입력해주세요.");
      setResult(null);
      return;
    }
    setError("");
    setResult(compute(parsed, type));
  }

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
              onChange={(e) => setRate(e.target.value)}
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
                className={`chip${type === c.value ? " active" : ""}${c.danger && type === c.value ? " danger-chip" : ""}`}
                onClick={() => {
                  setType(c.value);
                  setResult(null);
                }}
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

      {result && (
        <div className="result-card">
          <div className="result-top">
            <span className="result-emoji">{result.emoji}</span>
            <div>
              <div className={`result-time${result.isRed ? " red" : ""}`}>
                {result.time}
                {type === "altcoin" && result.rawTime !== "0일" && (
                  <span className="badge">잡코인 ×2</span>
                )}
              </div>
              <div className="result-temp">🌡️ 한강 수온: {result.temp}</div>
            </div>
          </div>
          <div className="result-divider" />
          <p className="result-comment">{result.comment}</p>
        </div>
      )}
    </div>
  );
}
