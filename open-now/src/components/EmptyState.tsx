import type { PlaceCategory } from '../types';
import styles from './EmptyState.module.css';

const CONFIG: Record<PlaceCategory, { emoji: string; label: string }> = {
  pharmacy:  { emoji: '💊', label: '근처 약국이 없어요' },
  hospital:  { emoji: '🏥', label: '근처 병원이 없어요' },
  emergency: { emoji: '🚨', label: '근처 응급실이 없어요' },
};

interface Props {
  category: PlaceCategory;
  openNowOnly?: boolean;
}

export function EmptyState({ category, openNowOnly }: Props) {
  const { emoji, label } = CONFIG[category];
  return (
    <div className={styles.wrap}>
      <span className={styles.emoji}>{emoji}</span>
      <p className={styles.title}>{label}</p>
      {openNowOnly && (
        <p className={styles.sub}>'지금 영업 중만' 필터를 해제해 보세요</p>
      )}
    </div>
  );
}
