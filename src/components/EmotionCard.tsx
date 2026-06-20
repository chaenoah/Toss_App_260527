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
        relative flex flex-col items-center justify-center gap-1.5
        rounded-2xl py-3 px-1 select-none cursor-pointer
        transition-all duration-150
        ${popping ? 'card-pop' : ''}
        ${selected ? 'scale-105' : 'active:scale-90'}
      `}
      style={{
        background: `linear-gradient(145deg, ${emotion.gradient[0]}, ${emotion.gradient[1]})`,
        boxShadow: selected
          ? `0 0 0 2.5px #1A1A1A, 0 6px 16px rgba(0,0,0,0.18)`
          : '0 2px 6px rgba(0,0,0,0.07)',
      }}
    >
      <span className="text-[26px] leading-none">{emotion.emoji}</span>
      <span
        className="text-[11px] font-bold leading-none"
        style={{ color: 'rgba(0,0,0,0.75)' }}
      >
        {emotion.label}
      </span>

      {selected && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
          style={{ background: '#1A1A1A' }}
        >
          <span className="text-white text-[9px] font-bold">✓</span>
        </div>
      )}
    </button>
  );
}
