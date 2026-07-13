import { StreakBadge } from "../components/StreakBadge";
import { dateKey } from "../utils/date";
import { haptic } from "../sdk";

interface Props {
  streak: number;
  drawnToday: boolean;
  onDraw: () => void;
}

/** 자판기 뽑기 진입점. streak 표시. */
export function HomeScreen({ streak, drawnToday, onDraw }: Props) {
  const handle = () => {
    haptic("tap");
    onDraw();
  };

  return (
    <div className="screen center">
      <header className="top">
        <h1 className="title">오늘의 재물운 자판기</h1>
        <p className="subtitle">{dateKey()} · 하루에 한 번 뽑아보세요</p>
        <StreakBadge streak={streak} />
      </header>

      <div className="machine">
        <div className="machine-head">
          <span className="machine-emoji">🏧</span>
          <span className="machine-label">GOLD LUCK</span>
        </div>
        <div className="glass">
          <div className="capsules" aria-hidden>
            {["#F5A623", "#2ECC71", "#3B70E3", "#FF6B6B", "#9B59B6", "#1ABC9C"].map(
              (c, i) => (
                <span key={i} className="capsule" style={{ background: c }} />
              ),
            )}
          </div>
        </div>
        <div className="slot">
          <div className="slot-mouth" />
        </div>
        <button className="btn btn-primary block lever" onClick={handle}>
          {drawnToday ? "오늘의 결과 다시 보기" : "오늘의 재물운 뽑기"}
        </button>
      </div>
    </div>
  );
}
