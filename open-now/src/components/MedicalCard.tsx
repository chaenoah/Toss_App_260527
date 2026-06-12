import { share, getTossShareLink } from '@apps-in-toss/web-framework';
import type { MedicalPlace, EmergencyRoom } from '../types';
import { formatDistance } from '../utils';
import styles from './MedicalCard.module.css';

interface Props {
  place: MedicalPlace;
  isFavorite?: boolean;
  onToggleFavorite?: (place: MedicalPlace) => void;
}

// ── 영업 상태 배지 ──────────────────────────────────────────────────────
function StatusBadge({ place }: { place: MedicalPlace }) {
  if (!place.isOpenNow) {
    return <span className={`${styles.badge} ${styles.closed}`}>마감</span>;
  }
  const todayKey = (['sun','mon','tue','wed','thu','fri','sat'] as const)[new Date().getDay()];
  const slot = place.hours[todayKey];
  if (slot) {
    const [ch, cm] = slot.close.split(':').map(Number);
    const closeMin = ch * 60 + cm;
    const nowMin   = new Date().getHours() * 60 + new Date().getMinutes();
    if (closeMin - nowMin <= 60)
      return <span className={`${styles.badge} ${styles.closing}`}>곧 마감</span>;
  }
  return <span className={`${styles.badge} ${styles.open}`}>영업중</span>;
}

// ── 혼잡도 배지 ────────────────────────────────────────────────────────
function CongestionBadge({ room }: { room: EmergencyRoom }) {
  const MAP = {
    low:     { label: '여유',    cls: styles.congLow },
    medium:  { label: '보통',    cls: styles.congMedium },
    high:    { label: '혼잡',    cls: styles.congHigh },
    unknown: { label: '확인불가', cls: styles.congUnknown },
  };
  const { label, cls } = MAP[room.congestion];
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

// ── 액션 핸들러 ────────────────────────────────────────────────────────
function handleCall(phone: string) {
  window.location.href = `tel:${phone}`;
}

function handleMap(name: string, lat: number, lng: number) {
  // 카카오맵 딥링크: 앱 설치 시 앱으로, 미설치 시 웹으로 fallback
  const deeplink = `kakaomap://route?ep=${lat},${lng}&by=FOOT`;
  const webFallback = `https://map.kakao.com/link/map/${encodeURIComponent(name)},${lat},${lng}`;

  // 딥링크 시도 후 500ms 내 반응 없으면 웹 열기
  const timer = setTimeout(() => {
    window.open(webFallback, '_blank', 'noopener noreferrer');
  }, 500);

  window.location.href = deeplink;
  // 앱 전환 성공 시 타이머 취소 (페이지가 blur되면 visibilitychange 발생)
  const cleanup = () => { clearTimeout(timer); document.removeEventListener('visibilitychange', cleanup); };
  document.addEventListener('visibilitychange', cleanup, { once: true });
}

async function handleShare(place: MedicalPlace) {
  try {
    const path  = `intoss://open-now/place/${place.category}/${place.id}`;
    const link  = await getTossShareLink(path);
    const text  = `[${place.name}]\n${place.address}\n📞 ${place.phone}\n\n${link}`;
    await share({ message: text });
  } catch {
    // 토스 앱 외부(브라우저 등)에서는 Web Share API fallback
    if (navigator.share) {
      navigator.share({ title: place.name, text: place.address }).catch(() => {});
    }
  }
}

// ── 카드 ─────────────────────────────────────────────────────────────
export function MedicalCard({ place, isFavorite = false, onToggleFavorite }: Props) {
  const isEmergency = place.category === 'emergency';
  const er = isEmergency ? (place as EmergencyRoom) : null;

  return (
    <li className={`${styles.card} ${isEmergency ? styles.emergencyCard : ''}`}>
      {/* 즐겨찾기 버튼 */}
      {onToggleFavorite && (
        <button
          className={`${styles.starBtn} ${isFavorite ? styles.starred : ''}`}
          onClick={() => onToggleFavorite(place)}
          type="button"
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}

      <div className={styles.top}>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            {isEmergency && <span className={styles.erBadge}>응급</span>}
            <span className={styles.name}>{place.name}</span>
            {er?.isTraumaCenter && <span className={styles.traumaBadge}>외상센터</span>}
          </div>

          <div className={styles.meta}>
            <span className={styles.distance}>{formatDistance(place.distance)}</span>
            <span className={styles.dot}>·</span>
            <StatusBadge place={place} />
            {er && <><span className={styles.dot}>·</span><CongestionBadge room={er} /></>}
          </div>

          <p className={styles.address}>{place.address}</p>

          {er && er.availableBeds != null && (
            <p className={styles.beds}>
              가용 병상{' '}
              <strong className={er.availableBeds <= 3 ? styles.bedsCritical : styles.bedsOk}>
                {er.availableBeds}
              </strong>
              {er.totalBeds != null && ` / ${er.totalBeds}개`}
            </p>
          )}
          {place.category === 'pharmacy' && place.nightCare && (
            <span className={styles.nightBadge}>🌙 야간조제</span>
          )}
          {place.category === 'hospital' && place.departments.length > 0 && (
            <p className={styles.departments}>{place.departments.slice(0, 3).join(' · ')}</p>
          )}
        </div>
      </div>

      {/* 액션 바 */}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => handleCall(place.phone)}
          type="button"
          aria-label="전화하기"
        >
          <PhoneIcon />
          <span>전화</span>
        </button>
        <div className={styles.divider} />
        <button
          className={styles.actionBtn}
          onClick={() => handleMap(place.name, place.lat, place.lng)}
          type="button"
          aria-label="길찾기"
        >
          <MapIcon />
          <span>길찾기</span>
        </button>
        <div className={styles.divider} />
        <button
          className={styles.actionBtn}
          onClick={() => handleShare(place)}
          type="button"
          aria-label="공유하기"
        >
          <ShareIcon />
          <span>공유</span>
        </button>
      </div>
    </li>
  );
}

// ── 아이콘 ────────────────────────────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="currentColor"/>
    </svg>
  );
}
function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>
    </svg>
  );
}
