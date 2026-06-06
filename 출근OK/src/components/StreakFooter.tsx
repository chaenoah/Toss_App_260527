import { getStreakLabel } from '../lib/copy';

interface Props {
  streak: number;
  onCalendarClick: () => void;
}

export function StreakFooter({ streak, onCalendarClick }: Props) {
  return (
    <div className="streak-footer">
      <span className="streak-footer__label">{getStreakLabel(streak)}</span>
      <button className="streak-footer__btn" onClick={onCalendarClick}>
        📅 캘린더
      </button>
    </div>
  );
}
