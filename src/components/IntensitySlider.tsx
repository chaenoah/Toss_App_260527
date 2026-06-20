interface Props {
  value: number;
  onChange: (v: number) => void;
}

const LABELS = ['', '아주 약하게', '약하게', '보통', '강하게', '아주 강하게'];
const EMOJIS = ['', '🌱', '🌿', '🌊', '🔥', '⚡'];

export function IntensitySlider({ value, onChange }: Props) {
  const pct = ((value - 1) / 4) * 100;

  return (
    <div className="w-full space-y-3">
      {/* Current label */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--ink-secondary)' }}>강도</span>
        <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--ink-primary)' }}>
          <span>{EMOJIS[value]}</span>
          <span>{LABELS[value]}</span>
        </span>
      </div>

      {/* Range */}
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #1A1A1A 0%, #1A1A1A ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`,
        }}
      />

      {/* Dot steps */}
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-150"
              style={
                value === n
                  ? { background: '#1A1A1A', color: '#FFFFFF', transform: 'scale(1.1)' }
                  : { background: '#F3F4F6', color: '#9CA3AF' }
              }
            >
              {n}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
