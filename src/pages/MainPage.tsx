import { useState } from 'react';
import { EMOTIONS } from '../data/emotions';
import { generatePrescription } from '../data/prescriptions';
import { EmotionCard } from '../components/EmotionCard';
import { IntensitySlider } from '../components/IntensitySlider';
import { haptic } from '../utils/bridge';
import { saveRecord, todayString } from '../utils/storage';
import type { Emotion, EmotionRecord } from '../types';

interface Props {
  onComplete: (record: EmotionRecord) => void;
  onCalendar: () => void;
}

export function MainPage({ onComplete, onCalendar }: Props) {
  const [selected, setSelected] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [memo, setMemo] = useState('');
  const [dispensing, setDispensing] = useState(false);

  function handleSelect(emotion: Emotion) {
    haptic('light');
    setSelected(emotion);
  }

  async function handleDispense() {
    if (!selected || dispensing) return;
    haptic('heavy');
    setDispensing(true);

    await new Promise(r => setTimeout(r, 600));

    const seed = Date.now();
    const prescription = generatePrescription(selected, intensity, memo, seed);
    const record: EmotionRecord = {
      id: String(seed),
      date: todayString(),
      emotion: selected,
      intensity,
      memo,
      prescription,
      createdAt: seed,
    };
    saveRecord(record);

    setDispensing(false);
    onComplete(record);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-snug">
            오늘, 당신의 기분에<br />어떤 처방이 필요한가요?
          </h1>
          <p className="text-sm text-gray-400 mt-1">감정을 골라 자판기를 눌러보세요</p>
        </div>
        <button
          onClick={onCalendar}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-lg flex-shrink-0"
        >
          📅
        </button>
      </div>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        {/* Emotion Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {EMOTIONS.map(e => (
            <EmotionCard
              key={e.id}
              emotion={e}
              selected={selected?.id === e.id}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Intensity + Memo — appears after selection */}
        {selected && (
          <div className="fade-up bg-white rounded-3xl p-5 shadow-sm space-y-5 mb-6">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {selected.emoji} <span className="text-gray-900">{selected.label}</span>을 얼마나 느끼나요?
              </p>
              <IntensitySlider value={intensity} onChange={setIntensity} />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                왜 그런 기분이 드세요? <span className="font-normal text-gray-400">(선택)</span>
              </label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value.slice(0, 50))}
                placeholder="짧게 적어봐요..."
                rows={2}
                className="w-full text-sm text-gray-800 bg-gray-50 rounded-xl px-4 py-3 resize-none outline-none border border-gray-100 focus:border-gray-300 transition-colors placeholder:text-gray-300"
              />
              <p className="text-right text-xs text-gray-300 mt-1">{memo.length}/50</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-10 pt-2">
        <button
          onClick={handleDispense}
          disabled={!selected || dispensing}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200
            ${selected && !dispensing
              ? 'bg-gray-900 text-white active:scale-95 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          {dispensing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="coin-spin inline-block">🪙</span>
              처방전 뽑는 중...
            </span>
          ) : (
            '🎰 처방전 받기'
          )}
        </button>
      </div>
    </div>
  );
}
