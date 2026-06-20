import { EMOTION_MAP } from '../data/emotions';
import { getWeekEntries } from '../utils/storage';
import type { MoodEntry } from '../types';

// Props kept for API compatibility; entries fetched internally
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Props { onClose: () => void }

export function WeeklyReportPage({ onClose }: Props) {
  const entries: MoodEntry[] = getWeekEntries();

  const emotionCounts: Record<string, { label: string; emoji: string; count: number }> = {};
  for (const e of entries) {
    const meta = EMOTION_MAP[e.emotion];
    if (!emotionCounts[e.emotion]) {
      emotionCounts[e.emotion] = { label: meta.label, emoji: meta.emoji, count: 0 };
    }
    emotionCounts[e.emotion].count++;
  }

  const top3 = Object.values(emotionCounts).sort((a, b) => b.count - a.count).slice(0, 3);
  const total = entries.length;
  const positiveCount = entries.filter(e => EMOTION_MAP[e.emotion].group === 'positive').length;
  const negativeCount = entries.filter(e => EMOTION_MAP[e.emotion].group === 'negative').length;
  const neutralCount = entries.filter(e => EMOTION_MAP[e.emotion].group === 'neutral').length;

  const insight = total === 0
    ? ''
    : positiveCount > negativeCount
    ? `긍정적인 감정이 ${Math.round((positiveCount / total) * 100)}%였어요. 좋은 한 주였군요 😊`
    : negativeCount > positiveCount
    ? `힘든 감정이 많았던 한 주였어요. 잘 버텨줬어요 💙`
    : '균형 잡힌 한 주를 보냈어요. 다양한 감정을 느낀 거예요 🌈';

  return (
    <div className="min-h-screen flex flex-col bg-white max-w-md mx-auto">
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-gray-100">
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          ←
        </button>
        <h2 className="font-bold text-gray-900">주간 리포트</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 pb-10">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 gap-3">
            <span className="text-5xl">📊</span>
            <p className="text-sm">이번 주 기록이 없어요</p>
          </div>
        ) : (
          <>
            <div className="bg-gray-900 text-white rounded-3xl p-5">
              <p className="text-xs text-gray-400 mb-1">이번 주 인사이트</p>
              <p className="font-semibold text-base leading-snug">{insight}</p>
              <p className="text-xs text-gray-400 mt-2">{total}일 기록 완료</p>
            </div>

            {top3.length > 0 && (
              <div className="bg-gray-50 rounded-3xl p-5">
                <p className="text-xs font-bold text-gray-500 mb-3">이번 주 감정 키워드 TOP {top3.length}</p>
                <div className="space-y-3">
                  {top3.map((e, idx) => (
                    <div key={e.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center font-bold text-sm text-gray-500">
                        {idx + 1}
                      </div>
                      <span className="text-xl">{e.emoji}</span>
                      <span className="font-semibold text-gray-900 flex-1">{e.label}</span>
                      <span className="text-sm text-gray-400">{e.count}회</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-3xl p-5">
              <p className="text-xs font-bold text-gray-500 mb-4">감정 비율</p>
              <div className="flex items-center gap-6">
                <DonutChart positive={positiveCount} negative={negativeCount} neutral={neutralCount} total={total} />
                <div className="space-y-2 flex-1">
                  <LegendItem color="#81C784" label="긍정" count={positiveCount} total={total} />
                  <LegendItem color="#78909C" label="부정" count={negativeCount} total={total} />
                  <LegendItem color="#90CAF9" label="중립" count={neutralCount} total={total} />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-5">
              <p className="text-xs font-bold text-gray-500 mb-3">일별 기록</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {entries.map(e => {
                  const meta = EMOTION_MAP[e.emotion];
                  return (
                    <div key={e.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
                      >
                        {meta.emoji}
                      </div>
                      <span className="text-[10px] text-gray-400">{e.date.slice(5)}</span>
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
  const r = 40;
  const circ = 2 * Math.PI * r;
  const posDash = (positive / total) * circ;
  const negDash = (negative / total) * circ;
  const neuDash = (neutral / total) * circ;

  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#E5E7EB" strokeWidth={16} />
      {positive > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#81C784" strokeWidth={16}
          strokeDasharray={`${posDash} ${circ}`} strokeDashoffset={0}
          transform="rotate(-90 50 50)" />
      )}
      {negative > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#78909C" strokeWidth={16}
          strokeDasharray={`${negDash} ${circ}`} strokeDashoffset={-posDash}
          transform="rotate(-90 50 50)" />
      )}
      {neutral > 0 && (
        <circle cx={50} cy={50} r={r} fill="none" stroke="#90CAF9" strokeWidth={16}
          strokeDasharray={`${neuDash} ${circ}`} strokeDashoffset={-(posDash + negDash)}
          transform="rotate(-90 50 50)" />
      )}
      <text x={50} y={54} textAnchor="middle" fontSize={13} fontWeight="bold" fill="#111">{total}일</text>
    </svg>
  );
}

function LegendItem({ color, label, count, total }: { color: string; label: string; count: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <span className="text-xs text-gray-400">{total > 0 ? Math.round((count / total) * 100) : 0}%</span>
    </div>
  );
}
