import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@apps-in-toss/web-framework';
import type { MedicalPlace } from '../types';

const STORAGE_KEY = 'favorites_v1';

function load(): MedicalPlace[] {
  return []; // 초기값; 실제 데이터는 Storage에서 비동기로 로드
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<MedicalPlace[]>(load);

  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return;
      try { setFavorites(JSON.parse(raw) as MedicalPlace[]); } catch { /* corrupt data */ }
    });
  }, []);

  const persist = useCallback(async (next: MedicalPlace[]) => {
    setFavorites(next);
    await Storage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const toggle = useCallback(
    (place: MedicalPlace) => {
      setFavorites((prev) => {
        const exists = prev.some((p) => p.id === place.id);
        const next = exists
          ? prev.filter((p) => p.id !== place.id)
          : [place, ...prev];
        Storage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((p) => p.id === id),
    [favorites],
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { favorites, toggle, isFavorite, clear };
}
