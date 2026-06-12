import styles from './SearchBar.module.css';

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = '약국·병원명으로 검색' }: Props) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="검색"
      />
      {value && (
        <button
          className={styles.clear}
          onClick={() => onChange('')}
          type="button"
          aria-label="검색어 지우기"
        >
          ✕
        </button>
      )}
    </div>
  );
}
