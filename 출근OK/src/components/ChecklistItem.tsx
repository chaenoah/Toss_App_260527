import type { ChecklistItem as Item } from '../types';

interface Props {
  item: Item;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ChecklistItem({ item, onToggle, onRemove }: Props) {
  return (
    <div className="checklist-item">
      <button
        className="checklist-item__toggle"
        onClick={() => onToggle(item.id)}
        aria-label={item.checked ? '체크 해제' : '체크'}
      >
        <span className="checklist-item__checkbox">
          {item.checked ? '✅' : '⬜'}
        </span>
        <span className={`checklist-item__label ${item.checked ? 'checklist-item__label--done' : ''}`}>
          {item.label}
          {item.required && <span className="checklist-item__required"> *</span>}
          {item.autoAdded && <span className="checklist-item__badge">자동</span>}
        </span>
      </button>
      {!item.required && (
        <button
          className="checklist-item__remove"
          onClick={() => onRemove(item.id)}
          aria-label="항목 삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}
