interface Props {
  badge: string;
}

/** 새 이정표 뱃지를 달성했을 때 보여주는 축하 배너. */
export function BadgeCelebration({ badge }: Props) {
  return (
    <div className="badge-celebrate">
      <span className="badge-celebrate-emoji">🎉</span>
      <span className="badge-celebrate-text">
        <b>{badge}</b> 연속 달성!
      </span>
      <span className="badge-celebrate-emoji">🎉</span>
    </div>
  );
}
