import type { WeeklyHours, BusinessHours } from '../types';

type DayKey = keyof WeeklyHours;

const DAY_KEYS: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function getTodayKey(): DayKey {
  return DAY_KEYS[new Date().getDay()];
}

export function isOpenNow(hours: WeeklyHours): boolean {
  const todayHours: BusinessHours | undefined = hours[getTodayKey()];
  if (!todayHours) return false;

  const now = new Date();
  const [oh, om] = todayHours.open.split(':').map(Number);
  const [ch, cm] = todayHours.close.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= oh * 60 + om && nowMin < ch * 60 + cm;
}

export function formatHours(hours: BusinessHours): string {
  return `${hours.open} ~ ${hours.close}`;
}
