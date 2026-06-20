interface Props {
  value: number;
  onChange: (v: number) => void;
}

const LABELS = ['', '아주 약하게', '약하게', '보통', '강하게', '아주 강하게'];

export function IntensitySlider({ value, onChange }: Props) {
  return (
    <div className="w-full px-1">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>약하게</span>
        <span className="font-semibold text-gray-700">{LABELS[value]}</span>
        <span>강하게</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #374151 0%, #374151 ${(value - 1) * 25}%, #E5E7EB ${(value - 1) * 25}%, #E5E7EB 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
              value === n ? 'bg-gray-800 text-white scale-110' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
