import type { EmotionRecord } from '../types';

const KEY = 'mood-vending-records';

export function getRecords(): EmotionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveRecord(record: EmotionRecord): void {
  const records = getRecords();
  const idx = records.findIndex(r => r.date === record.date);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  localStorage.setItem(KEY, JSON.stringify(records));
}

export function getRecordByDate(date: string): EmotionRecord | null {
  return getRecords().find(r => r.date === date) ?? null;
}

export function getRecordsByMonth(year: number, month: number): EmotionRecord[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getRecords().filter(r => r.date.startsWith(prefix));
}

export function getRecordsByWeek(year: number, week: number): EmotionRecord[] {
  const records = getRecords();
  return records.filter(r => {
    const d = new Date(r.date);
    const jan1 = new Date(year, 0, 1);
    const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
    const weekNum = Math.ceil((dayOfYear + jan1.getDay() + 1) / 7);
    return weekNum === week;
  });
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
