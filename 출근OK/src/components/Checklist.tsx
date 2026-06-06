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
}

export function Checklist({ items, onToggle, onRemove, onAdd, checkedCount, total }: Props) {
  const [inputVal, setInputVal] = useState('');

  function handleAdd() {
    if (!inputVal.trim()) return;
    onAdd(inputVal);
    setInputVal('');
  }

  return (
    <div className="checklist">
      <div className="checklist__header">
        <span className="checklist__title">출근 준비물</span>
        <span className="checklist__progress">
          {checkedCount}/{total}
        </span>
      </div>

      <div className="checklist__progress-bar">
        <div
          className="checklist__progress-fill"
          style={{ width: total > 0 ? `${(checkedCount / total) * 100}%` : '0%' }}
        />
      </div>

      <div className="checklist__items">
        {items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </div>

      <div className="checklist__add">
        <input
          className="checklist__add-input"
          type="text"
          placeholder="항목 추가 (예: 텀블러)"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="checklist__add-btn" onClick={handleAdd}>
          추가
        </button>
      </div>
    </div>
  );
}
