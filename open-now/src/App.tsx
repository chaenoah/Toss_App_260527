import { useMemo, useState } from 'react';
import type { PlaceCategory, MedicalPlace, UserLocation } from './types';
import { LocationHeader, CategoryTabs, MedicalCard, EmptyState } from './components';
import { usePharmacies, useHospitals, useEmergencyRooms, useLocation } from './hooks';
import './App.css';

// ── 위도·경도 → 시도/시군구 변환 (정적 매핑) ─────────────────────────
// 실제 서비스에서는 카카오/네이버 역지오코딩 API 사용 권장
function inferRegion(loc: UserLocation): { sido: string; sigungu: string } {
  // 단순 경계값 기반 추론 (예시: 광주광역시)
  if (loc.lat >= 35.05 && loc.lat <= 35.25 && loc.lng >= 126.7 && loc.lng <= 127.0) {
    if (loc.lat >= 35.17 && loc.lng <= 126.85) return { sido: '광주', sigungu: '광산구' };
    if (loc.lat >= 35.14 && loc.lat < 35.17)   return { sido: '광주', sigungu: '서구' };
    if (loc.lat >= 35.10 && loc.lat < 35.14)   return { sido: '광주', sigungu: '남구' };
    if (loc.lng >= 126.92)                      return { sido: '광주', sigungu: '동구' };
    return { sido: '광주', sigungu: '북구' };
  }
  // 서울 대략 범위
  if (loc.lat >= 37.4 && loc.lat <= 37.7 && loc.lng >= 126.8 && loc.lng <= 127.2) {
    return { sido: '서울', sigungu: '' };
  }
  return { sido: '광주', sigungu: '광산구' }; // fallback
}

function locationLabel(sido: string, sigungu: string): string {
  return sigungu ? `${sido} ${sigungu}` : sido;
}

// ── 로딩 스켈레톤 ──────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <li style={{
      listStyle: 'none',
      background: 'var(--bg-card)',
      borderRadius: 16,
      border: '1px solid var(--border)',
      height: 110,
      animation: 'pulse 1.4s ease-in-out infinite',
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
  const pharmacyQ  = usePharmacies(sido, sigungu, userLocation);
  const hospitalQ  = useHospitals(sido, sigungu, '', userLocation);
  const emergencyQ = useEmergencyRooms(sido, sigungu, userLocation);

  const queryMap = { pharmacy: pharmacyQ, hospital: hospitalQ, emergency: emergencyQ } as const;
  const { data = [], isLoading, isError } = queryMap[category];

  const counts = {
    pharmacy:  pharmacyQ.data?.length  ?? 0,
    hospital:  hospitalQ.data?.length  ?? 0,
    emergency: emergencyQ.data?.length ?? 0,
  };

  const filtered = useMemo<MedicalPlace[]>(() => {
    return openNowOnly ? data.filter((p) => p.isOpenNow) : data;
  }, [data, openNowOnly]);

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
      {/* counts를 상위로 올리는 대신 여기서 별도 prop으로 노출 */}
      <ul className="placeList" data-counts={JSON.stringify(counts)}>
        {filtered.slice(0, 5).map((place) => (
          <MedicalCard key={place.id} place={place} />
        ))}
      </ul>
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────
function App() {
  const locationState = useLocation();
  const [category, setCategory]   = useState<PlaceCategory>('pharmacy');
  const [openNowOnly, setOpenNowOnly] = useState(false);

  if (locationState.status === 'idle' || locationState.status === 'loading') {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>내 위치를 확인하고 있어요...</p>
      </div>
    );
  }

  if (locationState.status === 'error') {
    return (
      <div className="screen-center">
        <p>📍 위치 권한이 필요해요</p>
        <p className="error-detail">{locationState.message}</p>
      </div>
    );
  }

  const { location } = locationState;
  const { sido, sigungu } = inferRegion(location);

  return (
    <div className="app">
      <LocationHeader locationName={locationLabel(sido, sigungu)} />

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
        sido={sido}
        sigungu={sigungu}
        userLocation={location}
      />
    </div>
  );
}

export default App;
