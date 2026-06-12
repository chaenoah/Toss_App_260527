import styles from './EmergencyFAB.module.css';

export function EmergencyFAB() {
  return (
    <a
      href="tel:119"
      className={styles.fab}
      aria-label="119 응급전화"
      title="119 응급전화"
    >
      <span className={styles.cross}>+</span>
      <span className={styles.label}>119</span>
    </a>
  );
}
