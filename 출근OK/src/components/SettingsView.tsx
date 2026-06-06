import { useState } from 'react';
import type { ChecklistItem } from '../types';
import { CITIES } from '../lib/weather';
import { loadCity, saveCity } from '../lib/storage';

interface Props {
  items: ChecklistItem[];
  onBack: () => void;
  onAddItem: (label: string) => void;
  onRemoveItem: (id: string) => void;
  onToggleRequired: (id: string) => void;
  onMoveItem: (id: string, dir: 'up' | 'down') => void;
  onCityChange: (city: string) => void;
  commuteTime: string;
  onCommuteTimeChange: (t: string) => void;
}

export function SettingsView({
  items,
  onBack,
  onAddItem,
  onRemoveItem,
  onToggleRequired,
  onMoveItem,
  onCityChange,
  commuteTime,
  onCommuteTimeChange,
}: Props) {
  const [city, setCity] = useState(() => loadCity());
  const [newLabel, setNewLabel] = useState('');

  function handleCityChange(c: string) {
    setCity(c);
    saveCity(c);
    onCityChange(c);
  }

  function handleAdd() {
    if (!newLabel.trim()) return;
    onAddItem(newLabel.trim());
    setNewLabel('');
  }

  const nonAutoItems = items.filter((i) => !i.autoAdded);

  return (
    <div className="settings-view">
      <header className="settings-view__header">
        <button className="settings-view__back" onClick={onBack}>
          ← 뒤로
        </button>
        <h2 className="settings-view__title">설정</h2>
      </header>

      {/* 도시 설정 */}
      <section className="settings-section">
        <h3 className="settings-section__title">📍 내 출근 도시</h3>
        <div className="settings-city-grid">
          {Object.keys(CITIES).map((c) => (
            <button
              key={c}
              className={`settings-city-btn ${city === c ? 'settings-city-btn--active' : ''}`}
              onClick={() => handleCityChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* 출근 시간 */}
      <section className="settings-section">
        <h3 className="settings-section__title">⏰ 출근 시간</h3>
        <p className="settings-section__desc">
          앱 알림 기준 시간이에요. (현재는 참고용)
        </p>
        <input
          type="time"
          className="settings-time-input"
          value={commuteTime}
          onChange={(e) => onCommuteTimeChange(e.target.value)}
        />
      </section>

      {/* 체크리스트 항목 관리 */}
      <section className="settings-section">
        <h3 className="settings-section__title">📋 체크리스트 항목 관리</h3>
        <p className="settings-section__desc">
          * 필수 항목 · 선택 항목 구분 / 위아래 순서 이동 가능
        </p>

        <div className="settings-items">
          {nonAutoItems.map((item, idx) => (
            <div key={item.id} className="settings-item">
              <div className="settings-item__order">
                <button
                  className="settings-item__order-btn"
                  disabled={idx === 0}
                  onClick={() => onMoveItem(item.id, 'up')}
                  aria-label="위로"
                >
                  ▲
                </button>
                <button
                  className="settings-item__order-btn"
                  disabled={idx === nonAutoItems.length - 1}
                  onClick={() => onMoveItem(item.id, 'down')}
                  aria-label="아래로"
                >
                  ▼
                </button>
              </div>

              <span className="settings-item__label">{item.label}</span>

              <button
                className={`settings-item__required-btn ${item.required ? 'settings-item__required-btn--on' : ''}`}
                onClick={() => onToggleRequired(item.id)}
                title={item.required ? '필수 해제' : '필수로 설정'}
              >
                {item.required ? '필수 *' : '선택'}
              </button>

              <button
                className="settings-item__remove"
                onClick={() => onRemoveItem(item.id)}
                disabled={item.required}
                title={item.required ? '필수 항목은 삭제 불가' : '삭제'}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 항목 추가 */}
        <div className="settings-add">
          <input
            className="settings-add__input"
            type="text"
            placeholder="새 항목 추가 (예: 텀블러)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="settings-add__btn" onClick={handleAdd}>
            추가
          </button>
        </div>
      </section>
    </div>
  );
}
