import type { StreakData } from '../types';
import { isWeekend } from '../hooks/useStreak';

interface Props {
  streak: StreakData;
  onBack: () => void;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

export function CalendarView({ streak, onBack }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.toISOString().slice(0, 10);

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month); // 0=일

  const completedSet = new Set(streak.completedDates);

  // 이번 달 완벽 출근 일수 (평일만 카운트)
  const thisMonthCompleted = streak.completedDates.filter((d) => {
    return d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`);
  }).length;

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // 셀 배열 (빈 칸 + 날짜)
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDayStatus(day: number): 'completed' | 'missed' | 'weekend' | 'future' | 'today' {
    const dateStr = getDateStr(day);
    if (dateStr > today) return 'future';
    if (isWeekend(dateStr)) return 'weekend';
    if (completedSet.has(dateStr)) return 'completed';
    if (dateStr === today) return 'today';
    return 'missed';
  }

  const STATUS_EMOJI: Record<string, string> = {
    completed: '⭕',
    missed: '⚪',
    weekend: '',
    future: '',
    today: '',
  };

  return (
    <div className="calendar-view">
      <header className="calendar-view__header">
        <button className="calendar-view__back" onClick={onBack}>
          ← 뒤로
        </button>
        <h2 className="calendar-view__title">
          {year}년 {month + 1}월 출근 기록
        </h2>
      </header>

      {/* 이번 달 요약 */}
      <div className="calendar-summary">
        <div className="calendar-summary__item">
          <span className="calendar-summary__num">{thisMonthCompleted}</span>
          <span className="calendar-summary__label">이번달 완벽 출근</span>
        </div>
        <div className="calendar-summary__divider" />
        <div className="calendar-summary__item">
          <span className="calendar-summary__num">{streak.count}</span>
          <span className="calendar-summary__label">누적 streak</span>
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="calendar-grid">
        {weekdays.map((d) => (
          <div key={d} className={`calendar-grid__weekday ${d === '일' ? 'calendar-grid__weekday--sun' : d === '토' ? 'calendar-grid__weekday--sat' : ''}`}>
            {d}
          </div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="calendar-grid__cell" />;
          const status = getDayStatus(day);
          const dateStr = getDateStr(day);
          const isToday = dateStr === today;
          return (
            <div
              key={day}
              className={[
                'calendar-grid__cell',
                `calendar-grid__cell--${status}`,
                isToday ? 'calendar-grid__cell--today' : '',
              ].join(' ')}
            >
              <span className="calendar-grid__day">{day}</span>
              {STATUS_EMOJI[status] && (
                <span className="calendar-grid__emoji">{STATUS_EMOJI[status]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="calendar-legend">
        <span>⭕ 완료</span>
        <span>⚪ 미체크</span>
        <span>　 주말·공휴일 제외</span>
      </div>
    </div>
  );
}
