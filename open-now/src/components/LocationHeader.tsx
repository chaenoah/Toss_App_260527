import styles from './LocationHeader.module.css';

interface Props {
  locationName: string;
}

export function LocationHeader({ locationName }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <svg className={styles.pin} width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
        </svg>
        <span className={styles.name}>{locationName}</span>
        <span className={styles.label}>내 근처</span>
      </div>
    </header>
  );
}
