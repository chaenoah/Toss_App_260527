import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { getFortune, todayKey, type Fortune } from "./fortune";
import { haptic, loadItem, saveItem } from "./sdk";

const STORAGE_KEY = "jaemulun-record";

type Phase = "ready" | "dispensing" | "result";

interface Record {
  lastDate: string;
  streak: number;
}

/** dateKey(YYYY-MM-DD) 하루 전 날짜 키를 반환해요. */
function yesterdayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return todayKey(dt);
}

function App() {
  const fortune = useMemo<Fortune>(() => getFortune(), []);
  const [phase, setPhase] = useState<Phase>("ready");
  const [streak, setStreak] = useState(0);
  const recordRef = useRef<Record>({ lastDate: "", streak: 0 });

  // 저장된 기록을 불러와, 오늘 이미 뽑았으면 결과를 바로 보여줘요.
  useEffect(() => {
    let alive = true;
    (async () => {
      const raw = await loadItem(STORAGE_KEY);
      let rec: Record = { lastDate: "", streak: 0 };
      if (raw) {
        try {
          rec = JSON.parse(raw) as Record;
        } catch {
          /* 손상된 값이면 무시 */
        }
      }
      if (!alive) return;
      recordRef.current = rec;
      setStreak(rec.streak);
      if (rec.lastDate === fortune.date) {
        setPhase("result");
      }
    })();
    return () => {
      alive = false;
    };
  }, [fortune.date]);

  const draw = () => {
    if (phase === "dispensing") return;
    haptic("tap");
    setPhase("dispensing");

    const prev = recordRef.current;
    const nextStreak =
      prev.lastDate === yesterdayKey(fortune.date) ? prev.streak + 1 : 1;

    window.setTimeout(async () => {
      haptic("success");
      setStreak(nextStreak);
      const rec: Record = { lastDate: fortune.date, streak: nextStreak };
      recordRef.current = rec;
      await saveItem(STORAGE_KEY, JSON.stringify(rec));
      setPhase("result");
    }, 1500);
  };

  const shake = () => haptic("wiggle");

  return (
    <div className="screen">
      <header className="top">
        <h1 className="title">오늘의 재물운 자판기</h1>
        <p className="subtitle">
          {fortune.date} · 하루에 한 번, 오늘의 재물운을 뽑아보세요
        </p>
        {streak > 0 && <div className="streak">🔥 {streak}일 연속 방문</div>}
      </header>

      <div className="machine">
        <div className="machine-head">
          <span className="machine-emoji">🏧</span>
          <span className="machine-label">GOLD LUCK</span>
        </div>

        <div className="glass">
          {phase === "result" ? (
            <ResultCard fortune={fortune} />
          ) : (
            <div className="capsules" aria-hidden>
              {["#F5A623", "#2ECC71", "#3B70E3", "#FF6B6B", "#9B59B6", "#1ABC9C"].map(
                (c, i) => (
                  <span key={i} className="capsule" style={{ background: c }} />
                ),
              )}
              {phase === "dispensing" && <span className="capsule dropping" />}
            </div>
          )}
        </div>

        <div className="slot">
          <div className="slot-mouth" />
        </div>

        {phase !== "result" ? (
          <button
            className="lever"
            onClick={draw}
            disabled={phase === "dispensing"}
          >
            {phase === "dispensing" ? "뽑는 중…" : "뽑기"}
          </button>
        ) : (
          <button className="lever secondary" onClick={shake}>
            한 번 더 흔들기 ✨
          </button>
        )}
      </div>

      {phase === "result" && (
        <p className="footnote">
          오늘의 운세는 자정에 새로워져요. 내일 또 만나요! 👋
        </p>
      )}
    </div>
  );
}

function ResultCard({ fortune }: { fortune: Fortune }) {
  return (
    <div className="result">
      <div className="result-emoji">{fortune.emoji}</div>
      <div className="result-tier">{fortune.tier}</div>

      <div className="meter">
        <div
          className="meter-fill"
          style={{ width: `${fortune.score}%`, background: fortune.luckyColor.hex }}
        />
        <span className="meter-score">{fortune.score}점</span>
      </div>

      <p className="result-headline">{fortune.headline}</p>

      <div className="lucky-grid">
        <div className="lucky">
          <span className="lucky-key">행운의 아이템</span>
          <span className="lucky-val">{fortune.luckyItem}</span>
        </div>
        <div className="lucky">
          <span className="lucky-key">행운의 색</span>
          <span className="lucky-val">
            <span className="dot" style={{ background: fortune.luckyColor.hex }} />
            {fortune.luckyColor.name}
          </span>
        </div>
        <div className="lucky">
          <span className="lucky-key">행운의 숫자</span>
          <span className="lucky-val">{fortune.luckyNumber}</span>
        </div>
      </div>

      <div className="advice">💡 {fortune.advice}</div>
    </div>
  );
}

export default App;
