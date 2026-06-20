import { EMOTION_MAP } from '../data/emotions';
import { getWeekEntries } from '../utils/storage';
import type { MoodEntry } from '../types';

interface Props { onClose: () => void }

export function WeeklyReportPage({ onClose }: Props) {
  const entries: MoodEntry[] = getWeekEntries();

  const emotionCounts: Record<string, { label: string; emoji: string; count: number }> = {};
  for (const e of entries) {
    const meta = EMOTION_MAP[e.emotion];
    if (!emotionCounts[e.emotion])
      emotionCounts[e.emotion] = { label: meta.label, emoji: meta.emoji, count: 0 };
    emotionCounts[e.emotion].count++;
  }

  const top3          = Object.values(emotionCounts).sort((a, b) => b.count - a.count).slice(0, 3);
  const total         = entries.length;
  const positiveCount = entries.filter(e => EMOTION_MAP[e.emotion].group === 'positive').length;
  const negativeCount = entries.filter(e => EMOTION_MAP[e.emotion].group === 'negative').length;
  const neutralCount  = entries.filter(e => EMOTION_MAP[e.emotion].group === 'neutral').length;

  const insight = total === 0 ? '' :
    positiveCount > negativeCount
      ? `긍정적인 감정이 ${Math.round((positiveCount / total) * 100)}%였어요. 좋은 한 주였군요 😊`
      : negativeCount > positiveCount
      ? `힘든 감정이 많았던 한 주였어요. 잘 버텨줬어요 💙`
      : '균형 잡힌 한 주를 보냈어요. 다양한 감정을 느낀 거예요 🌈';

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'var(--bg-warm)' }}>

      {/* ── 헤더 ── */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >←</button>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--ink-secondary)' }}>
            리포트
          </p>
          <h2 className="font-bold text-sm leading-none" style={{ color: 'var(--ink-primary)' }}>주간 감정 리포트</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-10">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-5xl">📊</span>
            <p className="text-sm" style={{ color: 'var(--ink-tertiary)' }}>이번 주 기록이 없어요</p>
            <p className="text-xs" style={{ color: 'var(--ink-tertiary)' }}>감정을 기록하면 주간 리포트를 볼 수 있어요</p>
          </div>
        ) : (
          <>
            {/* 인사이트 카드 */}
            <div className="rounded-3xl p-5" style={{ background: '#1A1A1A' }}>
              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>이번 주 인사이트</p>
              <p className="font-semibold text-base leading-snug text-white">{insight}</p>
              <p className="text-xs mt-2" style={{ color: '#6B7280' }}>{total}일 기록 완료</p>
            </div>

            {/* TOP 3 감정 */}
            {top3.length > 0 && (
              <div className="bg-white rounded-3xl p-5 shadow-sm">
                <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--ink-secondary)' }}>
                  이번 주 감정 키워드 TOP {top3.length}
                </p>
                <div className="space-y-3">
                  {top3.map((e, idx) => (
                    <div key={e.label} className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          color: 'var(--ink-secondary)',
                          border: idx === 0 ? '2px solid #1A1A1A' : '1px solid #E5E7EB',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-xl">{e.emoji}</span>
                      <span className="font-semibold flex-1 text-sm" style={{ color: 'var(--ink-primary)' }}>
                        {e.label}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--bg-warm)', color: 'var(--ink-secondary)' }}>
                        {e.count}회
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 감정 비율 도넛 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--ink-secondary)' }}>
                감정 비율
              </p>
              <div className="flex items-center gap-6">
                <DonutChart positive={positiveCount} negative={negativeCount} neutral={neutralCount} total={total} />
                <div className="space-y-2.5 flex-1">
                  <LegendItem color="#81C784" label="긍정" count={positiveCount} total={total} />
                  <LegendItem color="#78909C" label="부정" count={negativeCount} total={total} />
                  <LegendItem color="#90CAF9" label="중립" count={neutralCount}  total={total} />
                </div>
              </div>
            </div>

            {/* 일별 기록 스크롤 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: 'var(--ink-secondary)' }}>
                일별 기록
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {entries.map(e => {
                  const meta = EMOTION_MAP[e.emotion];
                  return (
                    <div key={e.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                      >
                        {meta.emoji}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--ink-secondary)' }}>
                        {e.date.slice(5).replace('-', '/')}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
                        강도 {e.intensity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DonutChart({ positive, negative, neutral, total }: {
  positive: number; negative: number; neutral: number; total: number;
}) {
  const r    = 40;
  const circ = 2 * Math.PI * r;
  const pos  = (positive / total) * circ;
  const neg  = (negative / total) * circ;
  const neu  = (neutral  / total) * circ;

  return (
    <svg width={100} height={100} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <circle cx={50} cy={50} r={r} fill="none" stroke="#F3F4F6" strokeWidth={14} />
      {positive > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#81C784" strokeWidth={14}
          strokeDasharray={`${pos} ${circ}`} strokeDashoffset={0}
          transform="rotate(-90 50 50)" />
      )}
      {negative > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#78909C" strokeWidth={14}
          strokeDasharray={`${neg} ${circ}`} strokeDashoffset={-pos}
          transform="rotate(-90 50 50)" />
      )}
      {neutral > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#90CAF9" strokeWidth={14}
          strokeDasharray={`${neu} ${circ}`} strokeDashoffset={-(pos + neg)}
          transform="rotate(-90 50 50)" />
      )}
      <text x={50} y={47} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1A1A1A">{total}</text>
      <text x={50} y={59} textAnchor="middle" fontSize={9}  fill="#9CA3AF">일간</text>
    </svg>
  );
}

function LegendItem({ color, label, count, total }: {
  color: string; label: string; count: number; total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm flex-1" style={{ color: 'var(--ink-primary)' }}>{label}</span>
      <span className="text-xs font-semibold" style={{ color: 'var(--ink-secondary)' }}>{pct}%</span>
    </div>
  );
}
