import { badgesFor } from "../logic/streakManager";

interface Props {
  streak: number;
}

/** 연속 방문 일수 + 이정표 뱃지 표시 */
export function StreakBadge({ streak }: Props) {
  if (streak <= 0) return null;
  const badges = badgesFor(streak);
  return (
    <div className="streak-badge">
      <span className="streak-fire">🔥 {streak}일 연속</span>
      {badges.length > 0 && (
        <span className="streak-marks">{badges.join(" ")}</span>
      )}
    </div>
  );
}
