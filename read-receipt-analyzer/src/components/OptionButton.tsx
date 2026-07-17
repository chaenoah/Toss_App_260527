// 입력 화면에서 탭으로 고르는 선택지 버튼.
// 둥근 모서리, 큰 터치 영역(TDS 톤). 선택되면 파란 테두리로 강조.

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      className={`option-btn${selected ? " option-btn--selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      {/* 선택 시 우측에 체크 표시 */}
      <span className="option-btn__check" aria-hidden>
        {selected ? "✓" : ""}
      </span>
    </button>
  );
}
