import { useState } from 'react';
import type { ChecklistItem } from '../types';
import { CITIES, detectCity } from '../lib/weather';
import { useAlarm } from '../hooks/useAlarm';
import { nextAlarmLabel } from '../lib/alarm';

interface Props {
  items: ChecklistItem[];
  city: string;
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
  city,
  onBack,
  onAddItem,
  onRemoveItem,
  onToggleRequired,
  onMoveItem,
  onCityChange,
  commuteTime,
  onCommuteTimeChange,
}: Props) {
  const { enabled, alarmTime, permission, requesting, toggle, updateTime } = useAlarm();
  const [detecting, setDetecting] = useState(false);

  async function handleDetect() {
    setDetecting(true);
    try {
      const city = await detectCity();
      onCityChange(city);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '위치를 가져올 수 없어요');
    } finally {
      setDetecting(false);
    }
  }
  const [newLabel, setNewLabel] = useState('');

  function handleAdd() {
    if (!newLabel.trim()) return;
    onAddItem(newLabel.trim());
    setNewLabel('');
  }

  const nonAutoItems = items.filter((i) => !i.autoAdded);

  return (
    <div className="settings-view">
      <header className="settings-view__header">
        <button className="settings-view__back" onClick={onBack}>← 뒤로</button>
        <h2 className="settings-view__title">설정</h2>
      </header>

      {/* 도시 설정 */}
      <section className="settings-section">
        <h3 className="settings-section__title">📍 내 출근 도시</h3>
        <button
          className="settings-detect-btn"
          onClick={handleDetect}
          disabled={detecting}
        >
          {detecting ? '위치 감지 중…' : '📡 현재 위치로 자동 설정'}
        </button>
        <div className="settings-city-grid">
          {Object.keys(CITIES).map((c) => (
            <button
              key={c}
              className={`settings-city-btn ${city === c ? 'settings-city-btn--active' : ''}`}
              onClick={() => onCityChange(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* 출근 시간 */}
      <section className="settings-section">
        <h3 className="settings-section__title">⏰ 출근 시간</h3>
        <p className="settings-section__desc">날씨 기준 출근 시간</p>
        <input
          type="time"
          className="settings-time-input"
          value={commuteTime}
          onChange={(e) => onCommuteTimeChange(e.target.value)}
        />
      </section>

      {/* 아침 알람 */}
      <section className="settings-section">
        <h3 className="settings-section__title">🔔 아침 알람</h3>
        <p className="settings-section__desc">
          {permission === 'denied'
            ? '알림이 차단됐어요. 기기 설정에서 허용해 주세요.'
            : permission === 'unsupported'
            ? '이 환경에서는 알림이 지원되지 않아요.'
            : enabled
            ? nextAlarmLabel(alarmTime)
            : '알람이 꺼져 있어요'}
        </p>
        <div className="alarm-row">
          <input
            type="time"
            className="settings-time-input"
            value={alarmTime}
            onChange={(e) => updateTime(e.target.value)}
            disabled={!enabled}
          />
          <button
            className={`alarm-toggle ${enabled ? 'alarm-toggle--on' : ''}`}
            onClick={toggle}
            disabled={requesting || permission === 'unsupported'}
          >
            {requesting ? '요청 중…' : enabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </section>

      {/* 체크리스트 항목 관리 */}
      <section className="settings-section">
        <h3 className="settings-section__title">📋 항목 관리</h3>
        <p className="settings-section__desc">
          * 필수 항목은 삭제 불가 · ▲▼로 순서 변경
        </p>

        <div className="settings-items">
          {nonAutoItems.map((item, idx) => (
            <div key={item.id} className="settings-item">
              <div className="settings-item__order">
                <button
                  className="settings-item__order-btn"
                  disabled={idx === 0}
                  onClick={() => onMoveItem(item.id, 'up')}
                >▲</button>
                <button
                  className="settings-item__order-btn"
                  disabled={idx === nonAutoItems.length - 1}
                  onClick={() => onMoveItem(item.id, 'down')}
                >▼</button>
              </div>
              <span className="settings-item__label">{item.label}</span>
              <button
                className={`settings-item__required-btn ${item.required ? 'settings-item__required-btn--on' : ''}`}
                onClick={() => onToggleRequired(item.id)}
              >
                {item.required ? '필수 *' : '선택'}
              </button>
              <button
                className="settings-item__remove"
                onClick={() => onRemoveItem(item.id)}
                disabled={item.required}
              >✕</button>
            </div>
          ))}
        </div>

        <div className="settings-add">
          <input
            className="settings-add__input"
            type="text"
            placeholder="새 항목 추가 (예: 텀블러)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="settings-add__btn" onClick={handleAdd}>추가</button>
        </div>
      </section>
    </div>
  );
}
