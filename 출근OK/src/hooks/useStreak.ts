import { useState, useCallback } from 'react';
import type { StreakData } from '../types';
import { loadStreak, saveStreak } from '../lib/storage';

export function isWeekend(dateStr: string): boolean {
  // "YYYY-MM-DD" → Date 파싱 시 UTC 기준이 되므로 로컬 보정
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

export function prevWorkday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  do {
    dt.setDate(dt.getDate() - 1);
  } while (isWeekend(dt.toISOString().slice(0, 10)));
  return dt.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(() => loadStreak());

  const markComplete = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (streak.completedDates.includes(today)) return;

    // 직전 평일에 완료했으면 streak 연속
    const lastWorkday = prevWorkday(today);
    const prevCompleted = streak.completedDates.includes(lastWorkday);
    const newCount = prevCompleted ? streak.count + 1 : 1;

    const next: StreakData = {
      count: newCount,
      lastCompletedDate: today,
      completedDates: [...streak.completedDates, today],
    };
    saveStreak(next);
    setStreak(next);
  }, [streak]);

  /**
   * 스트릭 보험: 마지막 완료일과 오늘 사이에 놓친 평일들을 완료 처리로 메워
   * 연속 기록을 이어준다. (스트릭 보험 광고 시청 완료 시 호출)
   */
  const restoreStreak = useCallback(() => {
    if (!streak.lastCompletedDate) return;
    const today = todayStr();

    // 마지막 완료일(제외) ~ 오늘(제외) 사이의 놓친 평일 수집
    const gap: string[] = [];
    let cursor = prevWorkday(today);
    while (cursor > streak.lastCompletedDate) {
      if (!streak.completedDates.includes(cursor)) gap.push(cursor);
      cursor = prevWorkday(cursor);
    }
    if (gap.length === 0) return;

    const next: StreakData = {
      count: streak.count + gap.length, // 메운 평일만큼 연속 기록 유지
      lastCompletedDate: prevWorkday(today),
      completedDates: [...streak.completedDates, ...gap],
    };
    saveStreak(next);
    setStreak(next);
  }, [streak]);

  // 마일스톤 여부
  const isMilestone = [7, 30, 100, 365].includes(streak.count);

  return { streak, markComplete, restoreStreak, isMilestone };
}
