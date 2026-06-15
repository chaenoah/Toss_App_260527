import { useState, useCallback } from 'react';
import type { UserLocation } from '../types';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY as string;

export async function geocodeAddress(query: string): Promise<UserLocation | null> {
  try {
    const kakaoOrigin = import.meta.env.PROD ? 'https://dapi.kakao.com' : '/proxy/kakao';
    const url = `${kakaoOrigin}/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=1`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await res.json();
    const doc = json?.documents?.[0];
    if (!doc) return null;
    return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
  } catch {
    return null;
  }
}

export type LocationStatus =
  | { phase: 'idle' }
  | { phase: 'success'; location: UserLocation; source: 'manual' }
  | { phase: 'error'; message: string };

export function useCurrentLocation() {
  const [state, setState] = useState<LocationStatus>({ phase: 'idle' });

  const submitManualAddress = useCallback(async (address: string): Promise<boolean> => {
    const coords = await geocodeAddress(address);
    if (!coords) return false;
    setState({ phase: 'success', location: coords, source: 'manual' });
    return true;
  }, []);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, submitManualAddress, reset };
}
