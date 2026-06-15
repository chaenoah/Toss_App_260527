import styles from './LocationHeader.module.css';

interface Props {
  locationName: string;
  onChangeLocation: () => void;
}

export function LocationHeader({ locationName, onChangeLocation }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.appName}>
        <img src="/icon.svg" alt="" className={styles.logo} />
        <span>밤에 아플때</span>
      </div>
      <button className={styles.locationBtn} onClick={onChangeLocation} type="button" aria-label="위치 변경">
        <svg className={styles.pin} width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
        </svg>
        <span className={styles.locationName}>{locationName}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className={styles.chevron}>
          <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </header>
  );
}
