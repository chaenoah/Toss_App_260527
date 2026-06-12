import { useState } from 'react';
import styles from './LocationDeniedScreen.module.css';

interface Props {
  onOpenSettings: () => void;
  onSubmitAddress: (address: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function LocationDeniedScreen({ onOpenSettings, onSubmitAddress, isLoading }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) { setError('주소를 입력해 주세요'); return; }
    setError('');
    setSubmitting(true);
    const ok = await onSubmitAddress(trimmed);
    setSubmitting(false);
    if (!ok) setError('주소를 찾을 수 없어요. 더 구체적으로 입력해 보세요');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.icon}>📍</div>
      <h2 className={styles.title}>위치 권한이 필요해요</h2>
      <p className={styles.desc}>
        위치를 허용하면 가까운 약국·병원·응급실을<br />
        자동으로 찾아드릴 수 있어요
      </p>

      <button
        className={styles.primaryBtn}
        onClick={onOpenSettings}
        disabled={isLoading}
        type="button"
      >
        위치 권한 허용하기
      </button>

      <div className={styles.dividerRow}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>또는</span>
        <span className={styles.dividerLine} />
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.formLabel}>주소로 직접 검색</p>
        <div className={styles.inputRow}>
          <input
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="text"
            placeholder="예: 광주 광산구 수완동"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            disabled={submitting}
          />
          <button
            className={styles.searchBtn}
            type="submit"
            disabled={submitting || !input.trim()}
          >
            {submitting ? '…' : '검색'}
          </button>
        </div>
        {error && <p className={styles.errorMsg}>{error}</p>}
      </form>
    </div>
  );
}
