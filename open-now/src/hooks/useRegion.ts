import { useQuery } from '@tanstack/react-query';
import { reverseGeocode, type RegionInfo } from '../utils/geocode';
import type { UserLocation } from '../types';

/** 좌표 → 행정구역 정보. 결과는 세션 내 무한 캐시 (위치가 바뀌지 않으면 재호출 없음) */
export function useRegion(location: UserLocation | undefined) {
  return useQuery<RegionInfo, Error>({
    queryKey: ['region', location?.lat, location?.lng],
    queryFn: () => reverseGeocode(location!),
    enabled: location != null,
    staleTime: Infinity,  // 앱 실행 중 위치 변환은 1회면 충분
    retry: 2,
  });
}
