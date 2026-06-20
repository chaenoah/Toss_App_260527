import { useQuery } from '@tanstack/react-query';
import { getPharmacies, getHospitals, getEmergencyRooms } from '../api/medicalApi';
import type { UserLocation } from '../types';

const STALE_TIME = 60 * 60 * 1000; // 1시간

export function usePharmacies(
  sido: string,
  sigungu: string,
  userLocation: UserLocation,
) {
  return useQuery({
    queryKey: ['pharmacies', userLocation.lat, userLocation.lng],
    queryFn: () => getPharmacies(sido, sigungu, userLocation),
    staleTime: STALE_TIME,
    enabled: Boolean(userLocation.lat && userLocation.lng),
    placeholderData: [],
  });
}

export function useHospitals(
  sido: string,
  sigungu: string,
  dgsbjtCd = '',
  userLocation: UserLocation,
) {
  return useQuery({
    queryKey: ['hospitals', userLocation.lat, userLocation.lng, dgsbjtCd],
    queryFn: () => getHospitals(sido, sigungu, dgsbjtCd, userLocation),
    staleTime: STALE_TIME,
    enabled: Boolean(userLocation.lat && userLocation.lng),
    placeholderData: [],
  });
}

export function useEmergencyRooms(
  stage1: string,
  stage2: string,
  userLocation: UserLocation,
) {
  return useQuery({
    queryKey: ['emergencyRooms', stage1, stage2],
    queryFn: () => getEmergencyRooms(stage1, stage2, userLocation),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(stage1 && stage2),
    placeholderData: [],
  });
}
