import type { MoodEntry } from '../types';

const KEY = 'mood_vending_entries_v1';

export function getEntries(): MoodEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveEntry(entry: MoodEntry): void {
  const entries = getEntries();
  const idx = entries.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function getEntryByDate(date: string): MoodEntry | null {
  return getEntries().find(e => e.date === date) ?? null;
}

export function getEntriesByMonth(year: number, month: number): MoodEntry[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return getEntries().filter(e => e.date.startsWith(prefix));
}

export function getWeekEntries(): MoodEntry[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return getEntries().filter(e => new Date(e.date) >= monday);
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
