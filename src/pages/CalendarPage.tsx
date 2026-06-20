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
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const entries   = getEntriesByMonth(year, month);
  const entryMap  = Object.fromEntries(entries.map(e => [e.date, e]));

  const firstDay    = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const emotionCounts: Record<string, { label: string; emoji: string; count: number }> = {};
  for (const e of entries) {
    const meta = EMOTION_MAP[e.emotion];
    if (!emotionCounts[e.emotion])
      emotionCounts[e.emotion] = { label: meta.label, emoji: meta.emoji, count: 0 };
    emotionCounts[e.emotion].count++;
  }
  const topEmotion = Object.values(emotionCounts).sort((a, b) => b.count - a.count)[0];

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

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

      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >←</button>
        <h2 className="font-bold flex-1" style={{ color: 'var(--ink-primary)' }}>감정 캘린더</h2>
      </div>

      {/* ── 월 네비게이션 ── */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-lg active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >‹</button>
        <span className="font-bold text-base" style={{ color: 'var(--ink-primary)' }}>
          {year}년 {month}월
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-lg active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >›</button>
      </div>

      {/* ── 이달 대표 감정 배너 ── */}
      {topEmotion && (
        <div className="mx-4 mb-4 bg-white rounded-2xl px-4 py-3 shadow-sm fade-up">
          <p className="text-xs mb-0.5" style={{ color: 'var(--ink-secondary)' }}>이번 달 가장 많이 느낀 감정</p>
          <p className="font-bold" style={{ color: 'var(--ink-primary)' }}>
            {topEmotion.emoji} {topEmotion.label}
            <span className="font-normal text-sm ml-1" style={{ color: 'var(--ink-secondary)' }}>
              ({topEmotion.count}회)
            </span>
          </p>
        </div>
      )}

      {/* ── 요일 헤더 ── */}
      <div className="grid grid-cols-7 px-4 mb-1">
        {['일','월','화','수','목','금','토'].map((d, i) => (
          <div
            key={d}
            className="text-center text-xs font-semibold py-1"
            style={{ color: i === 0 ? '#EF4444' : i === 6 ? '#3B82F6' : 'var(--ink-tertiary)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── 캘린더 그리드 ── */}
      <div className="grid grid-cols-7 px-4 gap-y-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day     = i + 1;
          const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const entry   = entryMap[dateStr];
          const meta    = entry ? EMOTION_MAP[entry.emotion] : null;
          const isToday = dateStr === todayStr;
          const dow     = (firstDay + i) % 7; // 0=일, 6=토

          return (
            <button
              key={day}
              onClick={() => entry && onViewEntry(entry)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${entry ? 'active:scale-90' : ''}`}
              style={isToday ? { background: '#1A1A1A' } : undefined}
            >
              <span
                className="text-sm font-medium leading-none"
                style={{
                  color: isToday ? '#FFF'
                    : dow === 0 ? '#EF4444'
                    : dow === 6 ? '#3B82F6'
                    : 'var(--ink-primary)',
                }}
              >
                {day}
              </span>
              {meta ? (
                <div
                  className="w-6 h-6 rounded-full mt-1 flex items-center justify-center text-sm shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                >
                  {meta.emoji}
                </div>
              ) : (
                <div className="w-6 h-6 mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── 이달 기록 리스트 ── */}
      {entries.length > 0 ? (
        <div className="mt-6 px-4 pb-10">
          <h3 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: 'var(--ink-secondary)' }}>
            이번 달 기록
          </h3>
          <div className="space-y-2">
            {[...entries].reverse().map(e => {
              const meta = EMOTION_MAP[e.emotion];
              return (
                <button
                  key={e.id}
                  onClick={() => onViewEntry(e)}
                  className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 active:scale-95 transition-transform text-left shadow-sm"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                  >
                    {meta.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>
                      {meta.label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                      {e.date} · 강도 {e.intensity}
                    </div>
                    {e.memo && (
                      <div className="text-xs mt-0.5 truncate italic" style={{ color: 'var(--ink-tertiary)' }}>
                        "{e.memo}"
                      </div>
                    )}
                  </div>
                  <span style={{ color: 'var(--ink-tertiary)' }}>›</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
          <span className="text-5xl">🗓</span>
          <p className="text-sm" style={{ color: 'var(--ink-tertiary)' }}>이번 달 기록이 없어요</p>
          <p className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>감정을 기록하면 여기서 볼 수 있어요</p>
        </div>
      )}
    </div>
  );
}
