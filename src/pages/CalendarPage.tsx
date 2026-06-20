import { useState } from 'react';
import { EMOTION_MAP } from '../data/emotions';
import { getEntriesByMonth } from '../utils/storage';
import type { MoodEntry } from '../types';

interface Props {
  onBack: () => void;
  onViewEntry: (entry: MoodEntry) => void;
}

export function CalendarPage({ onBack, onViewEntry }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const entries = getEntriesByMonth(year, month);
  const entryMap = Object.fromEntries(entries.map(e => [e.date, e]));

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Most frequent emotion this month
  const emotionCounts: Record<string, { label: string; emoji: string; count: number }> = {};
  for (const e of entries) {
    const meta = EMOTION_MAP[e.emotion];
    if (!emotionCounts[e.emotion]) {
      emotionCounts[e.emotion] = { label: meta.label, emoji: meta.emoji, count: 0 };
    }
    emotionCounts[e.emotion].count++;
  }
  const topEmotion = Object.values(emotionCounts).sort((a, b) => b.count - a.count)[0];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'var(--bg-warm)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          ←
        </button>
        <h2 className="font-bold text-gray-900 flex-1">감정 캘린더</h2>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between px-5 py-4">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg">‹</button>
        <span className="font-bold text-gray-900 text-base">{year}년 {month}월</span>
        <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-lg">›</button>
      </div>

      {/* Summary banner */}
      {topEmotion && (
        <div className="mx-4 mb-4 bg-gray-50 rounded-2xl px-4 py-3 fade-up">
          <p className="text-xs text-gray-400 mb-0.5">이번 달 가장 많이 느낀 감정</p>
          <p className="font-bold text-gray-900">
            {topEmotion.emoji} {topEmotion.label}
            <span className="font-normal text-gray-400 text-sm ml-1">({topEmotion.count}회)</span>
          </p>
        </div>
      )}

      {/* Weekday headers */}
      <div className="grid grid-cols-7 px-4 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 px-4 gap-y-2">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const entry = entryMap[dateStr];
          const meta = entry ? EMOTION_MAP[entry.emotion] : null;
          const isToday = dateStr === todayStr;

          return (
            <button
              key={day}
              onClick={() => entry && onViewEntry(entry)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all
                ${entry ? 'active:scale-90' : ''}
                ${isToday ? 'bg-gray-900' : ''}
              `}
            >
              <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-gray-700'}`}>{day}</span>
              {meta ? (
                <div
                  className="w-5 h-5 rounded-full mt-0.5 flex items-center justify-center text-xs"
                  style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                >
                  {meta.emoji.slice(0, 2)}
                </div>
              ) : (
                <div className="w-5 h-5 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Recent list */}
      {entries.length > 0 && (
        <div className="mt-6 px-4 pb-10">
          <h3 className="text-sm font-bold text-gray-500 mb-3">이번 달 기록</h3>
          <div className="space-y-2">
            {[...entries].reverse().map(e => {
              const meta = EMOTION_MAP[e.emotion];
              return (
                <button
                  key={e.id}
                  onClick={() => onViewEntry(e)}
                  className="w-full flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 active:scale-95 transition-transform text-left"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{meta.label}</div>
                    <div className="text-xs text-gray-400">{e.date}</div>
                  </div>
                  <div className="text-xs text-gray-400">강도 {e.intensity}</div>
                  <span className="text-gray-300">›</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2 py-16">
          <span className="text-4xl">🗓</span>
          <p className="text-sm">이번 달 기록이 없어요</p>
        </div>
      )}
    </div>
  );
}
