import { useState } from 'react';
import styles from './AddressSearchScreen.module.css';

interface Props {
  onSubmit: (address: string) => Promise<boolean>;
}

const SUGGESTIONS = ['서울 강남구', '서울 마포구', '부산 해운대구', '인천 남동구', '대구 수성구'];

export function AddressSearchScreen({ onSubmit }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) { setError('동네 이름을 입력해 주세요'); return; }
    setError('');
    setLoading(true);
    const ok = await onSubmit(trimmed);
    setLoading(false);
    if (!ok) setError('주소를 찾을 수 없어요. 더 자세히 입력해 보세요');
  };

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <img src="/icon.svg" alt="" className={styles.logo} />
        <h1 className={styles.appName}>밤에 아플때</h1>
        <p className={styles.subtitle}>내 근처 약국·병원·응급실을 빠르게 찾아보세요</p>
      </div>

      <div className={styles.card}>
        <p className={styles.label}>동네를 알려주세요</p>
        <form
          className={styles.inputRow}
          onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }}
        >
          <input
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            type="text"
            placeholder="예: 서울 강남구, 광주 광산구"
            value={input}
            autoFocus
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            disabled={loading}
          />
          <button
            className={styles.searchBtn}
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className={styles.chip}
              type="button"
              onClick={() => { setInput(s); setError(''); handleSubmit(s); }}
              disabled={loading}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
