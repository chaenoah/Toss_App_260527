import type { UserLocation } from '../types';

/**
 * Haversine 공식으로 두 좌표 간 거리(미터) 계산.
 * 지구 반지름 6,371km 기준, 반환값은 정수(미터).
 */
export function calcDistance(
  from: UserLocation,
  toLat: number,
  toLng: number,
): number {
  const R = 6371000;
  const dLat = ((toLat - from.lat) * Math.PI) / 180;
  const dLng = ((toLng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * 미터 → 사람이 읽기 좋은 거리 문자열
 * - 1,000m 미만: "320m"
 * - 1,000m 이상: "1.2km"
 * - 10km 이상:   "12km" (소수점 생략)
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  const km = meters / 1000;
  return km >= 10 ? `${Math.round(km)}km` : `${km.toFixed(1)}km`;
}

/** 두 장소를 거리 기준 오름차순 정렬 */
export function sortByDistance<T extends { distance: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.distance - b.distance);
}
