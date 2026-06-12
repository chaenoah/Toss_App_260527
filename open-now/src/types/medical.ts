export type PlaceCategory = 'pharmacy' | 'hospital' | 'emergency';
/** 탭 포함 전체 뷰 타입 (favorites 탭 포함) */
export type AppTab = PlaceCategory | 'favorites';

export interface BusinessHours {
  open: string;  // "HH:MM" 형식
  close: string; // "HH:MM" 형식
}

export interface WeeklyHours {
  mon?: BusinessHours;
  tue?: BusinessHours;
  wed?: BusinessHours;
  thu?: BusinessHours;
  fri?: BusinessHours;
  sat?: BusinessHours;
  sun?: BusinessHours;
  holiday?: BusinessHours;
}

interface MedicalBase {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  /** 현재 위치로부터 계산된 거리 (미터) */
  distance: number;
  hours: WeeklyHours;
  isOpenNow: boolean;
}

export interface Pharmacy extends MedicalBase {
  category: 'pharmacy';
  /** 야간 조제 가능 여부 */
  nightCare: boolean;
}

export interface Hospital extends MedicalBase {
  category: 'hospital';
  /** 진료과목 */
  departments: string[];
  /** 응급실 보유 여부 */
  hasEmergency: boolean;
}

export interface EmergencyRoom extends MedicalBase {
  category: 'emergency';
  /** 응급실 가용 병상 수 */
  availableBeds: number | null;
  /** 응급실 총 병상 수 */
  totalBeds: number | null;
  /** 외상센터 여부 */
  isTraumaCenter: boolean;
  /** 실시간 혼잡도 */
  congestion: 'low' | 'medium' | 'high' | 'unknown';
}

export type MedicalPlace = Pharmacy | Hospital | EmergencyRoom;

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface SearchFilter {
  category: PlaceCategory;
  radius: number; // 미터
  openNowOnly: boolean;
}
