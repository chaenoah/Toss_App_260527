import { useState } from 'react';
import { haptic } from '../utils/bridge';

interface Props {
  onBack: () => void;
}

const STORAGE_KEY = 'mood_vending_settings_v1';

interface Settings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings(), ...JSON.parse(raw) } : defaultSettings();
  } catch { return defaultSettings(); }
}

function defaultSettings(): Settings {
  return { reminderEnabled: false, reminderHour: 21, reminderMinute: 0 };
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function SettingsPage({ onBack }: Props) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  function update(patch: Partial<Settings>) {
    haptic('light');
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  const timeLabel = `${String(settings.reminderHour).padStart(2, '0')}:${String(settings.reminderMinute).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'var(--bg-warm)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-5 border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >
          ←
        </button>
        <h2 className="font-bold" style={{ color: 'var(--ink-primary)' }}>설정</h2>
      </div>

      <div className="flex-1 px-4 py-6 space-y-3">

        {/* Reminder section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--ink-secondary)' }}>
              리마인더
            </p>
          </div>

          {/* Toggle row */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--ink-primary)' }}>저녁 리마인더</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
                매일 감정을 기록하도록 알려드려요
              </p>
            </div>
            <Toggle
              value={settings.reminderEnabled}
              onChange={v => update({ reminderEnabled: v })}
            />
          </div>

          {/* Time picker — shown when enabled */}
          {settings.reminderEnabled && (
            <div className="px-5 pb-5 fade-up">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ink-secondary)' }}>알림 시간</p>
                <div className="flex items-center gap-3">
                  <TimeSelect
                    label="시"
                    value={settings.reminderHour}
                    options={Array.from({ length: 24 }, (_, i) => i)}
                    onChange={v => update({ reminderHour: v })}
                  />
                  <span className="font-bold text-xl" style={{ color: 'var(--ink-primary)' }}>:</span>
                  <TimeSelect
                    label="분"
                    value={settings.reminderMinute}
                    options={[0, 10, 20, 30, 40, 50]}
                    onChange={v => update({ reminderMinute: v })}
                  />
                </div>
                <p className="text-sm font-bold mt-3" style={{ color: 'var(--ink-primary)' }}>
                  매일 {timeLabel}에 알림이 올 거예요 🌙
                </p>
              </div>

              {/* Push notification notice */}
              <div className="mt-3 flex items-start gap-2 px-1">
                <span className="text-base mt-0.5">💡</span>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-secondary)' }}>
                  푸시 알림은 곧 지원될 예정이에요.<br />
                  지금은 설정을 미리 저장해둘 수 있어요.
                </p>
              </div>
            </div>
          )}

          <div className="h-px mx-5" style={{ background: 'var(--bg-warm)' }} />
        </div>

        {/* App info */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--ink-secondary)' }}>
              앱 정보
            </p>
          </div>
          <InfoRow label="버전" value="1.0.0" />
          <InfoRow label="저장 방식" value="로컬 (내 기기)" />
          <InfoRow label="데이터 공유" value="없음" last />
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          <button
            className="w-full px-5 py-4 text-left active:bg-red-50 transition-colors"
            onClick={() => {
              if (confirm('모든 감정 기록을 삭제할까요? 되돌릴 수 없어요.')) {
                haptic('heavy');
                localStorage.removeItem('mood_vending_entries_v1');
                alert('기록이 삭제됐어요.');
              }
            }}
          >
            <p className="font-semibold text-sm text-red-500">기록 전체 삭제</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-secondary)' }}>
              모든 감정 기록이 영구 삭제돼요
            </p>
          </button>
        </div>

      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0"
      style={{ background: value ? '#1A1A1A' : '#E5E7EB' }}
    >
      <div
        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: value ? 'translateX(22px)' : 'translateX(4px)' }}
      />
    </button>
  );
}

function TimeSelect({ label, value, options, onChange }: {
  label: string;
  value: number;
  options: number[];
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1">
      <label className="text-[10px] font-semibold block mb-1" style={{ color: 'var(--ink-secondary)' }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none appearance-none text-center"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #E5E7EB',
          color: 'var(--ink-primary)',
        }}
      >
        {options.map(o => (
          <option key={o} value={o}>{String(o).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-3.5 ${!last ? 'border-b border-gray-50' : 'pb-5'}`}
    >
      <span className="text-sm" style={{ color: 'var(--ink-secondary)' }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--ink-primary)' }}>{value}</span>
    </div>
  );
}
