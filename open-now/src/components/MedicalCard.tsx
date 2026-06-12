import type { MedicalPlace, EmergencyRoom } from '../types';
import { formatDistance } from '../utils';
import styles from './MedicalCard.module.css';

interface Props {
  place: MedicalPlace;
  onShare?: (place: MedicalPlace) => void;
}

function StatusBadge({ place }: { place: MedicalPlace }) {
  if (!place.isOpenNow) {
    return <span className={`${styles.badge} ${styles.closed}`}>마감</span>;
  }

  // 마감 1시간 이내 → "곧 마감"
  const todayKey = (['sun','mon','tue','wed','thu','fri','sat'] as const)[new Date().getDay()];
  const todayHours = place.hours[todayKey];
  if (todayHours) {
    const [ch, cm] = todayHours.close.split(':').map(Number);
    const closeMin = ch * 60 + cm;
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    if (closeMin - nowMin <= 60) {
      return <span className={`${styles.badge} ${styles.closing}`}>곧 마감</span>;
    }
  }

  return <span className={`${styles.badge} ${styles.open}`}>영업중</span>;
}

function CongestionBadge({ room }: { room: EmergencyRoom }) {
  const MAP = {
    low:     { label: '여유', cls: styles.congLow },
    medium:  { label: '보통', cls: styles.congMedium },
    high:    { label: '혼잡', cls: styles.congHigh },
    unknown: { label: '확인불가', cls: styles.congUnknown },
  };
  const { label, cls } = MAP[room.congestion];
  return <span className={`${styles.badge} ${cls}`}>{label}</span>;
}

export function MedicalCard({ place, onShare }: Props) {
  const isEmergency = place.category === 'emergency';
  const er = isEmergency ? (place as EmergencyRoom) : null;

  const handleCall = () => {
    window.location.href = `tel:${place.phone}`;
  };

  const handleMap = () => {
    const url = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lng}`;
    window.open(url, '_blank', 'noopener noreferrer');
  };

  return (
    <li className={`${styles.card} ${isEmergency ? styles.emergencyCard : ''}`}>
      <div className={styles.top}>
        <div className={styles.info}>
          <div className={styles.nameRow}>
            {isEmergency && (
              <span className={styles.erBadge}>응급</span>
            )}
            <span className={styles.name}>{place.name}</span>
            {er?.isTraumaCenter && (
              <span className={styles.traumaBadge}>외상센터</span>
            )}
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

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={handleCall} type="button" aria-label="전화하기">
          <PhoneIcon />
          <span>전화</span>
        </button>
        <div className={styles.divider} />
        <button className={styles.actionBtn} onClick={handleMap} type="button" aria-label="지도 보기">
          <MapIcon />
          <span>지도</span>
        </button>
        {onShare && (
          <>
            <div className={styles.divider} />
            <button className={styles.actionBtn} onClick={() => onShare(place)} type="button" aria-label="공유하기">
              <ShareIcon />
              <span>공유</span>
            </button>
          </>
        )}
      </div>
    </li>
  );
}

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
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="currentColor"/>
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
