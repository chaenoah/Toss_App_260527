import { useState } from 'react';
import { EMOTIONS } from '../data/emotions';
import { generatePrescription } from '../data/prescriptions';
import { EmotionCard } from '../components/EmotionCard';
import { IntensitySlider } from '../components/IntensitySlider';
import { haptic } from '../utils/bridge';
import { saveEntry, todayString } from '../utils/storage';
import type { EmotionMeta, MoodEntry } from '../types';

interface Props {
  onComplete: (entry: MoodEntry) => void;
  onCalendar: () => void;
}

export function MainPage({ onComplete, onCalendar }: Props) {
  const [selected, setSelected] = useState<EmotionMeta | null>(null);
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [memo, setMemo] = useState('');
  const [dispensing, setDispensing] = useState(false);
  const [vendAnim, setVendAnim] = useState(false);

  function handleSelect(emotion: EmotionMeta) {
    haptic('light');
    setSelected(emotion);
  }

  async function handleDispense() {
    if (!selected || dispensing) return;
    haptic('heavy');
    setDispensing(true);
    setVendAnim(true);
    setTimeout(() => setVendAnim(false), 450);

    await new Promise(r => setTimeout(r, 800));

    const timestamp = Date.now();
    const prescription = generatePrescription(selected.key, intensity, memo, timestamp);
    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      date: todayString(),
      timestamp,
      emotion: selected.key,
      intensity,
      memo: memo || undefined,
      prescription,
    };
    saveEntry(entry);

    setDispensing(false);
    onComplete(entry);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'var(--bg-warm)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-5">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1 uppercase">감정 자판기</p>
          <h1 className="text-[22px] font-bold leading-snug" style={{ color: 'var(--ink-primary)' }}>
            오늘 기분이<br />어떠세요?
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-secondary)' }}>감정을 선택하면 처방전을 드려요</p>
        </div>
        <button
          onClick={onCalendar}
          className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0 active:scale-90 transition-transform"
        >
          📅
        </button>
      </div>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Emotion Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-5">
          {EMOTIONS.map(e => (
            <EmotionCard
              key={e.key}
              emotion={e}
              selected={selected?.key === e.key}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Intensity + Memo */}
        {selected && (
          <div className="fade-up bg-white rounded-3xl p-5 shadow-sm space-y-5 mb-4">
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--ink-primary)' }}>
                {selected.emoji} <span>{selected.label}</span>을 얼마나 느끼나요?
              </p>
              <IntensitySlider value={intensity} onChange={v => setIntensity(v as 1 | 2 | 3 | 4 | 5)} />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--ink-primary)' }}>
                어떤 일이 있었나요? <span className="font-normal" style={{ color: 'var(--ink-secondary)' }}>(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value.slice(0, 50))}
                placeholder="짧게 적어봐요..."
                rows={2}
                className="w-full text-sm rounded-2xl px-4 py-3 resize-none outline-none transition-colors placeholder:text-gray-300"
                style={{
                  background: 'var(--bg-warm)',
                  color: 'var(--ink-primary)',
                  border: '1.5px solid #E5E7EB',
                }}
                onFocus={e => (e.target.style.borderColor = '#9CA3AF')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
              <p className="text-right text-xs mt-1" style={{ color: 'var(--ink-tertiary)' }}>{memo.length}/50</p>
            </div>
          </div>
        )}

        {/* Vending machine label */}
        {!selected && (
          <div className="flex items-center justify-center gap-2 py-4 text-gray-300">
            <span className="text-2xl">🎰</span>
            <span className="text-xs tracking-wider">감정을 선택해주세요</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-10 pt-2">
        <button
          onClick={handleDispense}
          disabled={!selected || dispensing}
          className={`
            w-full py-4 rounded-2xl font-bold text-base
            transition-colors duration-200
            ${vendAnim ? 'vend-press' : ''}
            ${selected && !dispensing
              ? 'text-white shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
          style={selected && !dispensing ? {
            background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
          } : undefined}
        >
          {dispensing ? (
            <span className="flex items-center justify-center gap-2.5">
              <span className="coin-spin">🪙</span>
              <span>처방전 뽑는 중...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🎰</span>
              <span>처방전 받기</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
