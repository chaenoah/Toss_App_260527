import type { UserLocation } from '../types';

/** Haversine 공식으로 두 좌표 간 거리(미터) 계산 */
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

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
