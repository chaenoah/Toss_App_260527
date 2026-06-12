import type { WeeklyHours, BusinessHours } from '../types';

/** API dutyTime 형식(HHMM) → "HH:MM" 변환 */
function fmtHHMM(raw: string | number | undefined): string | undefined {
  if (raw == null || raw === '') return undefined;
  const s = String(raw).padStart(4, '0');
  return `${s.slice(0, 2)}:${s.slice(2, 4)}`;
}

function toSlot(
  start: string | number | undefined,
  end: string | number | undefined,
): BusinessHours | undefined {
  const open = fmtHHMM(start);
  const close = fmtHHMM(end);
  if (!open || !close) return undefined;
  return { open, close };
}

/** 공공데이터 API 응답 item → WeeklyHours */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseWeeklyHours(item: Record<string, any>): WeeklyHours {
  return {
    mon:     toSlot(item.dutyTime1s, item.dutyTime1c),
    tue:     toSlot(item.dutyTime2s, item.dutyTime2c),
    wed:     toSlot(item.dutyTime3s, item.dutyTime3c),
    thu:     toSlot(item.dutyTime4s, item.dutyTime4c),
    fri:     toSlot(item.dutyTime5s, item.dutyTime5c),
    sat:     toSlot(item.dutyTime6s, item.dutyTime6c),
    sun:     toSlot(item.dutyTime7s, item.dutyTime7c),
    holiday: toSlot(item.dutyTime8s, item.dutyTime8c),
  };
}

export type OperatingStatus = 'open' | 'closing' | 'closed';

const DAY_KEYS: (keyof WeeklyHours)[] = [
  'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
];

/** 현재 요일/시각 기준 운영 상태 반환 */
export function getOperatingStatus(hours: WeeklyHours): OperatingStatus {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const slot = hours[dayKey] ?? hours.holiday;

  if (!slot) return 'closed';

  const [oh, om] = slot.open.split(':').map(Number);
  const [ch, cm] = slot.close.split(':').map(Number);

  const nowMin  = now.getHours() * 60 + now.getMinutes();
  const openMin  = oh * 60 + om;
  const closeMin = ch * 60 + cm;

  // 야간 영업(close < open)을 지원: ex) 22:00 ~ 02:00
  const normalized = closeMin < openMin ? closeMin + 24 * 60 : closeMin;

  if (nowMin < openMin || nowMin >= normalized) return 'closed';
  if (normalized - nowMin <= 60)                return 'closing';
  return 'open';
}

/** 오늘 운영 시간 문자열 반환 (없으면 null) */
export function todayHoursLabel(hours: WeeklyHours): string | null {
  const now = new Date();
  const dayKey = DAY_KEYS[now.getDay()];
  const slot = hours[dayKey];
  if (!slot) return null;
  return `${slot.open} ~ ${slot.close}`;
}
