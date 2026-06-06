import type { ViewType } from '../types';

interface Props {
  current: ViewType;
  onChange: (v: ViewType) => void;
}

const TABS: { id: ViewType; icon: string; label: string }[] = [
  { id: 'home',     icon: '🏠', label: '홈' },
  { id: 'calendar', icon: '📅', label: '캘린더' },
  { id: 'settings', icon: '⚙️', label: '설정' },
];

export function BottomNav({ current, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav__tab ${current === tab.id ? 'bottom-nav__tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
