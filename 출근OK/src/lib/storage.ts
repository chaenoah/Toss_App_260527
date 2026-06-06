import type { AppState, StreakData } from '../types';

const KEYS = {
  APP: 'chulgeun_ok_app',
  STREAK: 'chulgeun_ok_streak',
  CITY: 'chulgeun_ok_city',
} as const;

export const DEFAULT_ITEMS = [
  { id: 'wallet', label: '지갑', required: true },
  { id: 'phone', label: '핸드폰', required: true },
  { id: 'id_card', label: '사원증', required: true },
  { id: 'transit', label: '교통카드', required: true },
  { id: 'mask', label: '마스크', required: false },
  { id: 'earphone', label: '이어폰', required: false },
  { id: 'charger', label: '충전기', required: false },
  { id: 'laptop', label: '노트북', required: false },
  { id: 'lunchbox', label: '도시락', required: false },
];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(KEYS.APP);
    if (raw) {
      const state: AppState = JSON.parse(raw);
      // 날짜가 바뀌었으면 체크 초기화 (자동추가 항목은 삭제)
      if (state.lastResetDate !== todayStr()) {
        return {
          items: state.items
            .filter((i) => !i.autoAdded)
            .map((i) => ({ ...i, checked: false })),
          lastResetDate: todayStr(),
        };
      }
      return state;
    }
  } catch {
    /* ignore */
  }
  return {
    items: DEFAULT_ITEMS.map((i) => ({ ...i, checked: false, autoAdded: false })),
    lastResetDate: todayStr(),
  };
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(KEYS.APP, JSON.stringify(state));
}

export function loadStreak(): StreakData {
  try {
    const raw = localStorage.getItem(KEYS.STREAK);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { count: 0, lastCompletedDate: null, completedDates: [] };
}

export function saveStreak(data: StreakData): void {
  localStorage.setItem(KEYS.STREAK, JSON.stringify(data));
}

export function loadCity(): string {
  return localStorage.getItem(KEYS.CITY) ?? '광주';
}

export function saveCity(city: string): void {
  localStorage.setItem(KEYS.CITY, city);
}
