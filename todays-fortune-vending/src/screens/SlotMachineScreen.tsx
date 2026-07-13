import { useEffect } from "react";
import { haptic } from "../sdk";

interface Props {
  onDone: () => void;
}

const REELS = ["💰", "🪙", "💎", "🧧", "🀄", "📈"];

/** 뽑기 애니메이션 (약 2.2초 후 결과로 전환) */
export function SlotMachineScreen({ onDone }: Props) {
  useEffect(() => {
    haptic("tickMedium");
    const t = window.setTimeout(() => {
      haptic("success");
      onDone();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [onDone]);

  return (
    <div className="screen center">
      <div className="slotmachine">
        <div className="reels">
          {[0, 1, 2].map((i) => (
            <div className="reel" key={i}>
              <div className="reel-track" style={{ animationDelay: `${i * 0.12}s` }}>
                {[...REELS, ...REELS, ...REELS].map((s, j) => (
                  <span className="reel-item" key={j}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="slot-caption">오늘의 재물운을 뽑는 중…</p>
      </div>
    </div>
  );
}
