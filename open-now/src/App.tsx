import { useMemo, useState } from 'react';
import type { PlaceCategory, MedicalPlace } from './types';
import { LocationHeader, CategoryTabs, MedicalCard, EmptyState } from './components';
import {
  DUMMY_PHARMACIES,
  DUMMY_HOSPITALS,
  DUMMY_EMERGENCY_ROOMS,
} from './data/dummy';
import './App.css';

const LOCATION_NAME = '광주 광산구';

const ALL_PLACES: Record<PlaceCategory, MedicalPlace[]> = {
  pharmacy:  DUMMY_PHARMACIES,
  hospital:  DUMMY_HOSPITALS,
  emergency: DUMMY_EMERGENCY_ROOMS,
};

function App() {
  const [category, setCategory] = useState<PlaceCategory>('pharmacy');
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const places = useMemo<MedicalPlace[]>(() => {
    const list = ALL_PLACES[category];
    return openNowOnly ? list.filter((p) => p.isOpenNow) : list;
  }, [category, openNowOnly]);

  const counts = useMemo(() => ({
    pharmacy:  DUMMY_PHARMACIES.length,
    hospital:  DUMMY_HOSPITALS.length,
    emergency: DUMMY_EMERGENCY_ROOMS.length,
  }), []);

  return (
    <div className="app">
      <LocationHeader locationName={LOCATION_NAME} />

      <CategoryTabs active={category} onChange={setCategory} counts={counts} />

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

      {places.length === 0 ? (
        <EmptyState category={category} openNowOnly={openNowOnly} />
      ) : (
        <ul className="placeList">
          {places.slice(0, 5).map((place) => (
            <MedicalCard key={place.id} place={place} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
