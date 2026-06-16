import { useMemo, useState } from 'react';
import type { AppTab, PlaceCategory, MedicalPlace, UserLocation } from './types';
import {
  LocationHeader,
  CategoryTabs,
  MedicalCard,
  EmptyState,
  AddressSearchScreen,
  DisclaimerModal,
  EmergencyFAB,
  SearchBar,
} from './components';
import {
  usePharmacies,
  useHospitals,
  useEmergencyRooms,
  useCurrentLocation,
  useDisclaimer,
  useFavorites,
  useDebounce,
} from './hooks';
import { sortByDistance } from './utils';
import './App.css';

const PREVIEW_COUNT = 5;

function CardSkeleton() {
  return (
    <li style={{
      listStyle: 'none', background: 'var(--bg-card)', borderRadius: 16,
      border: '1px solid var(--border)', height: 118,
      animation: 'skelPulse 1.4s ease-in-out infinite',
    }} />
  );
}

interface ContentProps {
  category: PlaceCategory;
  openNowOnly: boolean;
  searchQuery: string;
  sido: string;
  sigungu: string;
  userLocation: UserLocation;
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

function FavoritesContent({
  favorites, isFavorite, onToggleFavorite, searchQuery,
}: {
  favorites: MedicalPlace[];
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (place: MedicalPlace) => void;
  searchQuery: string;
}) {
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

function App() {
  const { state: locState, submitManualAddress, reset } = useCurrentLocation();
  const { needsDisclaimer, accept: acceptDisclaimer } = useDisclaimer();
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

  const [tab, setTab]               = useState<AppTab>('pharmacy');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [rawSearch, setRawSearch]     = useState('');
  const searchQuery = useDebounce(rawSearch, 280);

  if (locState.phase === 'idle') {
    return <AddressSearchScreen onSubmit={submitManualAddress} />;
  }

  const region = locState.region;
  const userLocation = locState.location;
  const isPlaceTab = tab !== 'favorites';

  return (
    <div className="app">
      {needsDisclaimer === true && (
        <DisclaimerModal onAccept={acceptDisclaimer} />
      )}

      <LocationHeader locationName={region.label} onChangeLocation={reset} />

      <CategoryTabs active={tab} onChange={setTab} favoritesCount={favorites.length} />

      <SearchBar value={rawSearch} onChange={setRawSearch} />

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
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <EmergencyFAB />
    </div>
  );
}

export default App;
