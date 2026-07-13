// 연속 방문(streak) 관리.
//
// - 어제 방문 → 오늘 방문: streak +1
// - 하루라도 건너뜀: streak = 1 로 리셋
// - 단, 하루 놓친 경우엔 "복구권"으로 살릴 수 있어요(Phase 2, 리워드 광고 연동).
import { dateKey, yesterdayKey } from "../utils/date";
import { loadItem, saveItem } from "../sdk";

const KEY = "jaemulun-record";

export interface StreakRecord {
  lastDate: string; // 마지막으로 뽑은 날 (YYYY-MM-DD)
  streak: number; // 연속 일수
}

const EMPTY: StreakRecord = { lastDate: "", streak: 0 };

export async function loadStreak(): Promise<StreakRecord> {
  const raw = await loadItem(KEY);
  if (!raw) return { ...EMPTY };
  try {
    const rec = JSON.parse(raw) as StreakRecord;
    if (typeof rec.streak === "number" && typeof rec.lastDate === "string") {
      return rec;
    }
  } catch {
    /* 손상된 값이면 초기화 */
  }
  return { ...EMPTY };
}

/** 오늘 이미 뽑았는지 여부 */
export function hasDrawnToday(rec: StreakRecord, today = dateKey()): boolean {
  return rec.lastDate === today;
}

/** 하루를 건너뛰어 streak 가 끊긴 상태인지 (복구권 노출 조건, Phase 2) */
export function isBroken(rec: StreakRecord, today = dateKey()): boolean {
  return (
    rec.streak > 0 &&
    rec.lastDate !== today &&
    rec.lastDate !== yesterdayKey(today)
  );
}

/** 오늘 뽑기를 확정하고 streak 를 갱신해요. 갱신된 기록을 반환해요. */
export async function commitToday(
  rec: StreakRecord,
  today = dateKey(),
): Promise<StreakRecord> {
  if (rec.lastDate === today) return rec; // 오늘 이미 반영됨

  const continued = rec.lastDate === yesterdayKey(today);
  const next: StreakRecord = {
    lastDate: today,
    streak: continued ? rec.streak + 1 : 1,
  };
  await saveItem(KEY, JSON.stringify(next));
  return next;
}

/** 획득한 뱃지 목록 (7일/30일 등 이정표) */
export function badgesFor(streak: number): string[] {
  const badges: string[] = [];
  if (streak >= 3) badges.push("🔥 3일");
  if (streak >= 7) badges.push("⭐ 7일");
  if (streak >= 30) badges.push("👑 30일");
  if (streak >= 100) badges.push("💎 100일");
  return badges;
}
