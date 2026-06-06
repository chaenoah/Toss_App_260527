import { useState } from 'react';
import type { ChecklistItem as Item } from '../types';
import { ChecklistItem } from './ChecklistItem';

interface Props {
  items: Item[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (label: string) => void;
  checkedCount: number;
  total: number;
  allChecked: boolean;
}

export function Checklist({ items, onToggle, onRemove, onAdd, checkedCount, total, allChecked }: Props) {
  const [inputVal, setInputVal] = useState('');
  const pct = total > 0 ? (checkedCount / total) * 100 : 0;

  function handleAdd() {
    if (!inputVal.trim()) return;
    onAdd(inputVal);
    setInputVal('');
  }

  return (
    <div className={`checklist ${allChecked ? 'checklist--done' : ''}`}>
      <div className="checklist__header">
        <span className="checklist__title">출근 준비물</span>
        <span className={`checklist__progress ${allChecked ? 'checklist__progress--done' : ''}`}>
          {checkedCount}/{total}
        </span>
      </div>

      <div className="checklist__progress-bar">
        <div
          className={`checklist__progress-fill ${allChecked ? 'checklist__progress-fill--done' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="checklist__items">
        {items.length === 0 && (
          <div className="checklist__empty">
            아래에서 항목을 추가해 보세요 ✏️
          </div>
        )}
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
        ))}
      </div>

      {allChecked && (
        <div className="checklist__done-banner">
          ✅ 출근 준비 완료! 오늘도 화이팅이에요
        </div>
      )}

      <div className="checklist__add">
        <input
          className="checklist__add-input"
          type="text"
          placeholder="항목 추가 (예: 텀블러)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="checklist__add-btn" onClick={handleAdd}>추가</button>
      </div>
    </div>
  );
}
