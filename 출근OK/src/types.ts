export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  required: boolean;
  autoAdded?: boolean; // 날씨 등으로 자동 추가된 항목
}

export interface WeatherData {
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
}

export interface AirQualityData {
  pm25: number; // µg/m³
  level: 'good' | 'moderate' | 'bad' | 'very_bad';
  label: string;
  emoji: string;
}

export interface StreakData {
  count: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  completedDates: string[];
}

export type ViewType = 'home' | 'calendar' | 'settings';

export interface AppState {
  items: ChecklistItem[];
  lastResetDate: string; // "YYYY-MM-DD"
}
