import { useMemo, useState } from 'react';
import type { AppTab, PlaceCategory, MedicalPlace, UserLocation } from './types';
import {
  LocationHeader,
  CategoryTabs,
  MedicalCard,
  EmptyState,
  LocationDeniedScreen,
  DisclaimerModal,
  EmergencyFAB,
  SearchBar,
} from './components';
import {
  usePharmacies,
  useHospitals,
  useEmergencyRooms,
  useCurrentLocation,
  useRegion,
  useDisclaimer,
  useFavorites,
  useDebounce,
} from './hooks';
import { sortByDistance } from './utils';
import './App.css';

const PREVIEW_COUNT = 5;

// ── 로딩 스켈레톤 ──────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <li style={{
      listStyle: 'none', background: 'var(--bg-card)', borderRadius: 16,
      border: '1px solid var(--border)', height: 118,
      animation: 'skelPulse 1.4s ease-in-out infinite',
    }} />
  );
}

// ── 의료기관 목록 ─────────────────────────────────────────────────────
interface ContentProps {
  category: PlaceCategory;
  openNowOnly: boolean;
  searchQuery: string;
  sido: string;
  sigungu: string;
  userLocation: UserLocation;
  favorites: MedicalPlace[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (place: MedicalPlace) => void;
}

function PlaceContent({
  category, openNowOnly, searchQuery,
  sido, sigungu, userLocation,
  isFavorite, onToggleFavorite,
}: ContentProps) {
  const [showAll, setShowAll] = useState(false);

  const pharmacyQ  = usePharmacies(sido, sigungu, userLocation);
  const hospitalQ  = useHospitals(sido, sigungu, '', userLocation);
  const emergencyQ = useEmergencyRooms(sido, sigungu, userLocation);

  const queryMap = { pharmacy: pharmacyQ, hospital: hospitalQ, emergency: emergencyQ } as const;
  const { data = [], isLoading, isError } = queryMap[category];

  // 거리순 → 영업 중 필터 → 검색어 필터
  const visible = useMemo(() => {
    let list = sortByDistance(data as MedicalPlace[]);
    if (openNowOnly) list = list.filter((p) => p.isOpenNow);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, openNowOnly, searchQuery]);

  // 탭 전환 시 전체 보기 초기화
  useMemo(() => { setShowAll(false); }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = showAll ? visible : visible.slice(0, PREVIEW_COUNT);
  const hasMore   = !showAll && visible.length > PREVIEW_COUNT;

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
  if (visible.length === 0) {
    return <EmptyState category={category} openNowOnly={openNowOnly} />;
  }

  return (
    <>
      <ul className="placeList">
        {displayed.map((place) => (
          <MedicalCard
            key={place.id}
            place={place}
            isFavorite={isFavorite(place.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ul>
      {hasMore && (
        <button className="showAllBtn" onClick={() => setShowAll(true)} type="button">
          전체 보기 ({visible.length}개)
        </button>
      )}
    </>
  );
}

// ── 즐겨찾기 탭 ──────────────────────────────────────────────────────
interface FavTabProps {
  favorites: MedicalPlace[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (place: MedicalPlace) => void;
  searchQuery: string;
}

function FavoritesContent({ favorites, isFavorite, onToggleFavorite, searchQuery }: FavTabProps) {
  const filtered = useMemo(() => {
    if (!searchQuery) return favorites;
    const q = searchQuery.toLowerCase();
    return favorites.filter(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
    );
  }, [favorites, searchQuery]);

  if (favorites.length === 0) {
    return (
      <div className="screen-center" style={{ minHeight: 'auto', padding: '60px 24px' }}>
        <p style={{ fontSize: 36 }}>⭐</p>
        <p>즐겨찾기한 곳이 없어요</p>
        <p className="error-detail">카드의 ☆을 눌러 저장하세요</p>
      </div>
    );
  }
  if (filtered.length === 0) {
    return (
      <div className="screen-center" style={{ minHeight: 'auto', padding: '60px 24px' }}>
        <p>검색 결과가 없어요</p>
      </div>
    );
  }

  return (
    <ul className="placeList">
      {filtered.map((place) => (
        <MedicalCard
          key={place.id}
          place={place}
          isFavorite={isFavorite(place.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  );
}

// ── App ───────────────────────────────────────────────────────────────
function App() {
  const { state: locState, retry, openLocationSettings, submitManualAddress } = useCurrentLocation();
  const { needsDisclaimer, accept: acceptDisclaimer } = useDisclaimer();
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

  const [tab, setTab]           = useState<AppTab>('pharmacy');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [rawSearch, setRawSearch]     = useState('');
  const searchQuery = useDebounce(rawSearch, 280);

  const userLocation: UserLocation | undefined =
    locState.phase === 'success' ? locState.location : undefined;

  const regionQuery = useRegion(userLocation);

  // ── 위치 로딩 ─────────────────────────────────────────────────────
  if (locState.phase === 'idle' || locState.phase === 'loading') {
    return (
      <div className="screen-center">
        <div className="spinner" />
        <p>내 위치를 확인하고 있어요...</p>
      </div>
    );
  }
  if (locState.phase === 'denied') {
    return (
      <LocationDeniedScreen
        onOpenSettings={openLocationSettings}
        onSubmitAddress={submitManualAddress}
      />
    );
  }
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

  const region = regionQuery.data ?? { sido: '', sigungu: '', sidoShort: '', label: '내 근처' };
  const headerLabel = locState.source === 'manual' ? `📌 ${region.label}` : region.label;

  const isPlaceTab = tab !== 'favorites';

  return (
    <div className="app">
      {/* 면책 모달 (첫 진입 1회) */}
      {needsDisclaimer === true && (
        <DisclaimerModal onAccept={acceptDisclaimer} />
      )}

      <LocationHeader locationName={headerLabel} />

      <CategoryTabs
        active={tab}
        onChange={setTab}
        favoritesCount={favorites.length}
      />

      {/* 검색바 */}
      <SearchBar value={rawSearch} onChange={setRawSearch} />

      {/* 필터바 (즐겨찾기 탭에선 숨김) */}
      {isPlaceTab && (
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
      )}

      {/* 콘텐츠 */}
      {tab === 'favorites' ? (
        <FavoritesContent
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          searchQuery={searchQuery}
        />
      ) : (
        <PlaceContent
          category={tab}
          openNowOnly={openNowOnly}
          searchQuery={searchQuery}
          sido={region.sidoShort}
          sigungu={region.sigungu}
          userLocation={locState.location}
          favorites={favorites}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* 119 플로팅 버튼 */}
      <EmergencyFAB />
    </div>
  );
}

export default App;
