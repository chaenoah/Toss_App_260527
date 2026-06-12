import type { AppTab } from '../types';
import styles from './CategoryTabs.module.css';

interface Props {
  active: AppTab;
  onChange: (tab: AppTab) => void;
  favoritesCount?: number;
}

const TABS: { key: AppTab; label: string; emoji: string }[] = [
  { key: 'pharmacy',  label: '약국',    emoji: '💊' },
  { key: 'hospital',  label: '병원',    emoji: '🏥' },
  { key: 'emergency', label: '응급실',  emoji: '🚨' },
  { key: 'favorites', label: '즐겨찾기', emoji: '⭐' },
];

export function CategoryTabs({ active, onChange, favoritesCount }: Props) {
  return (
    <nav className={styles.nav}>
      {TABS.map(({ key, label, emoji }) => {
        const count = key === 'favorites' ? favoritesCount : undefined;
        return (
          <button
            key={key}
            className={[
              styles.tab,
              active === key ? styles.active : '',
              key === 'emergency' ? styles.emergency : '',
              key === 'favorites' ? styles.favorites : '',
            ].join(' ')}
            onClick={() => onChange(key)}
            type="button"
          >
            <span className={styles.emoji}>{emoji}</span>
            <span className={styles.label}>{label}</span>
            {count != null && count > 0 && (
              <span className={styles.count}>{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
