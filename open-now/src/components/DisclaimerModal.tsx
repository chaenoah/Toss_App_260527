import styles from './DisclaimerModal.module.css';

interface Props {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: Props) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className={styles.sheet}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title} id="disclaimer-title">이용 전 확인해 주세요</h2>

        <ul className={styles.list}>
          <li>본 앱은 <strong>공공데이터</strong>를 기반으로 정보를 제공합니다.</li>
          <li>실제 영업시간·운영 상태와 다를 수 있으니 방문 전 <strong>전화 확인</strong>을 권장합니다.</li>
          <li>응급 상황 시 즉시 <strong>119</strong>에 연락하세요.</li>
          <li>약국·병원 정보는 의료 결정의 참고 자료로만 사용하세요.</li>
        </ul>

        <button className={styles.btn} onClick={onAccept} type="button">
          확인했어요
        </button>
      </div>
    </div>
  );
}
