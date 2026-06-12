import { useMemo, useState } from 'react';
import type { PlaceCategory, MedicalPlace, UserLocation } from './types';
import {
  LocationHeader,
  CategoryTabs,
  MedicalCard,
  EmptyState,
  LocationDeniedScreen,
} from './components';
import { usePharmacies, useHospitals, useEmergencyRooms, useCurrentLocation, useRegion } from './hooks';
import { sortByDistance } from './utils';
import './App.css';

const PREVIEW_COUNT = 5;

// ── 로딩 스켈레톤 ──────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <li style={{
      listStyle: 'none',
      background: 'var(--bg-card)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      height: 112,
      animation: 'skelPulse 1.4s ease-in-out infinite',
    }} />
  );
}

// ── 메인 콘텐츠 ───────────────────────────────────────────────────────
interface ContentProps {
  category: PlaceCategory;
  openNowOnly: boolean;
  sido: string;
  sigungu: string;
  userLocation: UserLocation;
}

function PlaceContent({ category, openNowOnly, sido, sigungu, userLocation }: ContentProps) {
  const [showAll, setShowAll] = useState(false);

  const pharmacyQ  = usePharmacies(sido, sigungu, userLocation);
  const hospitalQ  = useHospitals(sido, sigungu, '', userLocation);
  const emergencyQ = useEmergencyRooms(sido, sigungu, userLocation);

  const queryMap = { pharmacy: pharmacyQ, hospital: hospitalQ, emergency: emergencyQ } as const;
  const { data = [], isLoading, isError } = queryMap[category];

  // 거리순 정렬 → 영업 중만 필터
  const sorted = useMemo(() => sortByDistance(data as MedicalPlace[]), [data]);
  const filtered = useMemo(
    () => openNowOnly ? sorted.filter((p) => p.isOpenNow) : sorted,
    [sorted, openNowOnly],
  );
  const visible = showAll ? filtered : filtered.slice(0, PREVIEW_COUNT);
  const hasMore = !showAll && filtered.length > PREVIEW_COUNT;

  // 탭 전환 시 접기 초기화
  useMemo(() => { setShowAll(false); }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <ul className="placeList">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </ul>
    );
  }

  if (isError) {
    return (
      <div className="screen-center" style={{ minHeight: 'auto', padding: '40px 24px' }}>
        <p>데이터를 불러오지 못했어요</p>
        <p className="error-detail">잠시 후 다시 시도해 주세요</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return <EmptyState category={category} openNowOnly={openNowOnly} />;
  }

  return (
    <>
      <ul className="placeList">
        {visible.map((place) => (
          <MedicalCard key={place.id} place={place} />
        ))}
      </ul>
      {hasMore && (
        <button className="showAllBtn" onClick={() => setShowAll(true)} type="button">
          전체 보기 ({filtered.length}개)
        </button>
      )}
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────
function App() {
  const { state: locState, retry, openLocationSettings, submitManualAddress } = useCurrentLocation();
  const [category, setCategory]       = useState<PlaceCategory>('pharmacy');
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const userLocation: UserLocation | undefined =
    locState.phase === 'success' ? locState.location : undefined;

  const regionQuery = useRegion(userLocation);

  // ── 위치 로딩 중 ────────────────────────────────────────────────────
  if (locState.phase === 'idle' || locState.phase === 'loading') {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>내 위치를 확인하고 있어요...</p>
      </div>
    );
  }

  // ── 권한 거부 → 수동 입력 ──────────────────────────────────────────
  if (locState.phase === 'denied') {
    return (
      <LocationDeniedScreen
        onOpenSettings={openLocationSettings}
        onSubmitAddress={submitManualAddress}
      />
    );
  }

  // ── 기타 에러 (GPS 오류 등) ────────────────────────────────────────
  if (locState.phase === 'error') {
    return (
      <div className="screen-center">
        <p>위치를 가져오지 못했어요</p>
        <p className="error-detail">{locState.message}</p>
        <button className="retryBtn" onClick={retry} type="button">다시 시도</button>
      </div>
    );
  }

  // ── 역지오코딩 로딩 ───────────────────────────────────────────────
  if (regionQuery.isLoading) {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>동네 정보를 확인하고 있어요...</p>
      </div>
    );
  }

  const region = regionQuery.data ?? {
    sido: '', sigungu: '', sidoShort: '', label: '내 근처',
  };

  const locationLabel =
    locState.source === 'manual'
      ? `📌 ${region.label}`
      : region.label;

  return (
    <div className="app">
      <LocationHeader locationName={locationLabel} />

      <CategoryTabs active={category} onChange={setCategory} />

      <div className="filterBar">
        <span className="filterLabel">가까운 순</span>
        <div className="toggleRow">
          <span className="toggleLabel">지금 영업 중만</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={openNowOnly}
              onChange={(e) => setOpenNowOnly(e.target.checked)}
            />
            <span className="toggleTrack" />
            <span className="toggleThumb" />
          </label>
        </div>
      </div>

      <PlaceContent
        category={category}
        openNowOnly={openNowOnly}
        sido={region.sidoShort}
        sigungu={region.sigungu}
        userLocation={locState.location}
      />
    </div>
  );
}

export default App;
