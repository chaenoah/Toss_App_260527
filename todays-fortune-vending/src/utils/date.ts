// 날짜 유틸. 로컬 시각 기준 YYYY-MM-DD 키를 다뤄요.

/** Date → 'YYYY-MM-DD' (로컬 기준) */
export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 'YYYY-MM-DD' 하루 전 키 */
export function yesterdayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return dateKey(dt);
}

/** 주말(토/일) 여부 */
export function isWeekend(key: string): boolean {
  const [y, m, d] = key.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}
