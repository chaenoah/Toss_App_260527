import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentLocation,
  GetCurrentLocationPermissionError,
  openPermissionDialog,
} from '@apps-in-toss/web-framework';
import type { UserLocation } from '../types';

// ── 카카오 좌표 검색 (주소 → 좌표) ──────────────────────────────────────
const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY as string;

export async function geocodeAddress(query: string): Promise<UserLocation | null> {
  try {
    const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=1`;
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    });
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

// ── 상태 타입 ──────────────────────────────────────────────────────────
export type LocationStatus =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'success';  location: UserLocation; source: 'gps' | 'manual' }
  | { phase: 'denied' }   // 권한 거부 → 수동 입력 유도
  | { phase: 'error';   message: string };

// ── Hook ──────────────────────────────────────────────────────────────
export function useCurrentLocation() {
  const [state, setState] = useState<LocationStatus>({ phase: 'idle' });

  // GPS 위치 요청
  const requestGPS = useCallback(async () => {
    setState({ phase: 'loading' });
    try {
      const loc = await getCurrentLocation({ accuracy: 'FINE' });
      setState({
        phase: 'success',
        location: { lat: loc.latitude, lng: loc.longitude },
        source: 'gps',
      });
    } catch (err) {
      if (err instanceof GetCurrentLocationPermissionError) {
        setState({ phase: 'denied' });
      } else if (navigator.geolocation) {
        // 브라우저 환경 폴백 (Toss SDK 미지원 시)
        navigator.geolocation.getCurrentPosition(
          (pos) => setState({
            phase: 'success',
            location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            source: 'gps',
          }),
          () => setState({ phase: 'denied' }),
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else {
        setState({
          phase: 'error',
          message: err instanceof Error ? err.message : '위치를 가져올 수 없어요',
        });
      }
    }
  }, []);

  // 앱 마운트 시 자동 요청
  useEffect(() => { requestGPS(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 권한 거부 후 설정 화면 유도
  const openLocationSettings = useCallback(async () => {
    const result = await openPermissionDialog({ name: 'geolocation', access: 'access' });
    if (result === 'allowed') await requestGPS();
    // denied 상태는 유지 (수동 입력 모달 계속 표시)
  }, [requestGPS]);

  // 주소 직접 입력 → 좌표 변환 후 성공 처리
  const submitManualAddress = useCallback(async (address: string): Promise<boolean> => {
    setState({ phase: 'loading' });
    const coords = await geocodeAddress(address);
    if (!coords) {
      setState({ phase: 'denied' }); // 실패 시 다시 수동 입력 화면으로
      return false;
    }
    setState({ phase: 'success', location: coords, source: 'manual' });
    return true;
  }, []);

  // 재시도
  const retry = useCallback(() => requestGPS(), [requestGPS]);

  return { state, retry, openLocationSettings, submitManualAddress };
}
