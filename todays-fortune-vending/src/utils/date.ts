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

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

/** 'YYYY-MM-DD' 의 요일 한 글자 (일~토) */
export function weekdayLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return WEEKDAY[new Date(y, m - 1, d).getDay()];
}

/** 해당 날짜가 속한 주(월~일)의 7개 날짜 키 배열 */
export function weekDates(key: string = dateKey()): string[] {
  const [y, m, d] = key.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  const backToMon = (base.getDay() + 6) % 7; // 월요일까지 되돌리는 일수
  const mon = new Date(base);
  mon.setDate(base.getDate() - backToMon);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(mon);
    dt.setDate(mon.getDate() + i);
    return dateKey(dt);
  });
}
