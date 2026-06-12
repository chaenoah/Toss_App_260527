import type { PlaceCategory } from '../types';
import styles from './CategoryTabs.module.css';

interface Props {
  active: PlaceCategory;
  onChange: (cat: PlaceCategory) => void;
  counts?: Partial<Record<PlaceCategory, number>>;
}

const TABS: { key: PlaceCategory; label: string; emoji: string }[] = [
  { key: 'pharmacy',  label: '약국',   emoji: '💊' },
  { key: 'hospital',  label: '병원',   emoji: '🏥' },
  { key: 'emergency', label: '응급실', emoji: '🚨' },
];

export function CategoryTabs({ active, onChange, counts }: Props) {
  return (
    <nav className={styles.nav}>
      {TABS.map(({ key, label, emoji }) => (
        <button
          key={key}
          className={`${styles.tab} ${active === key ? styles.active : ''} ${key === 'emergency' ? styles.emergency : ''}`}
          onClick={() => onChange(key)}
          type="button"
        >
          <span className={styles.emoji}>{emoji}</span>
          <span className={styles.label}>{label}</span>
          {counts?.[key] != null && (
            <span className={styles.count}>{counts[key]}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
