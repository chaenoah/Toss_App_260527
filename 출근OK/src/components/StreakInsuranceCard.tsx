interface Props {
  streak: number;
  usesThisMonth: number;
  monthlyLimit: number;
  watching: boolean;
  onProtect: () => void;
}

export function StreakInsuranceCard({ streak, usesThisMonth, monthlyLimit, watching, onProtect }: Props) {
  const remaining = monthlyLimit - usesThisMonth;
  return (
    <div className="streak-insurance">
      <div className="streak-insurance__body">
        <div className="streak-insurance__title">
          🔥 {streak}일 연속 기록이 끊길 위기예요!
        </div>
        <div className="streak-insurance__desc">
          광고 보고 연속 기록을 지켜보세요 (이번 달 {remaining}회 남음)
        </div>
      </div>
      <button
        className="streak-insurance__btn"
        onClick={onProtect}
        disabled={watching}
      >
        {watching ? '광고 재생 중…' : '광고 보고 지키기'}
      </button>
    </div>
  );
}
