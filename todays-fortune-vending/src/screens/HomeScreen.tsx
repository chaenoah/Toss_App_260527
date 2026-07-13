import { useEffect, useState } from "react";
import { StreakBadge } from "../components/StreakBadge";
import { dateKey, isWeekend } from "../utils/date";
import { haptic } from "../sdk";
import { getBokjumeoni } from "../logic/bokjumeoni";
import { trackScreen } from "../utils/eventTracking";

interface Props {
  streak: number;
  drawnToday: boolean;
  onDraw: () => void;
  onWeekend: () => void;
}

/** 자판기 뽑기 진입점. streak / 복주머니 / 주말 특집 표시. */
export function HomeScreen({ streak, drawnToday, onDraw, onWeekend }: Props) {
  const weekend = isWeekend(dateKey());
  const [bok, setBok] = useState(0);

  useEffect(() => {
    trackScreen("home");
    let alive = true;
    getBokjumeoni().then((c) => {
      if (alive) setBok(c);
    });
    return () => {
      alive = false;
    };
  }, []);

  const handle = () => {
    haptic("tap");
    onDraw();
  };

  return (
    <div className="screen center">
      <header className="top">
        <h1 className="title">오늘의 재물운 자판기</h1>
        <p className="subtitle">{dateKey()} · 하루에 한 번 뽑아보세요</p>
        <div className="home-chips">
          <StreakBadge streak={streak} />
          {bok > 0 && <span className="bok-chip">🧧 복주머니 {bok}</span>}
        </div>
      </header>

      {weekend && (
        <button className="weekend-banner" onClick={onWeekend}>
          🎉 주말 특집 · 이번 주 재물운 총평 보기
        </button>
      )}

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

      {!weekend && (
        <button className="week-link" onClick={onWeekend}>
          이번 주 재물운 총평 보기
        </button>
      )}
    </div>
  );
}
