import { useState } from 'react';
import type { EmotionMeta } from '../types';

interface Props {
  emotion: EmotionMeta;
  selected: boolean;
  onSelect: (emotion: EmotionMeta) => void;
}

export function EmotionCard({ emotion, selected, onSelect }: Props) {
  const [popping, setPopping] = useState(false);

  function handleClick() {
    setPopping(true);
    setTimeout(() => setPopping(false), 250);
    onSelect(emotion);
  }

  return (
    <button
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center gap-1 rounded-2xl p-3
        transition-all duration-150 select-none cursor-pointer border-2
        ${popping ? 'card-pop' : ''}
        ${selected
          ? 'border-gray-800 shadow-lg scale-105'
          : 'border-transparent shadow-sm active:scale-95'}
      `}
      style={{
        background: `linear-gradient(135deg, ${emotion.gradient[0]}, ${emotion.gradient[1]})`,
      }}
    >
      <span className="text-2xl leading-none">{emotion.emoji}</span>
      <span className="text-xs font-semibold text-gray-800">{emotion.label}</span>
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-white text-[9px]">✓</span>
        </div>
      )}
    </button>
  );
}
