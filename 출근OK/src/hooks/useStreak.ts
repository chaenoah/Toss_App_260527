import { useState, useCallback } from 'react';
import type { StreakData } from '../types';
import { loadStreak, saveStreak } from '../lib/storage';

export function isWeekend(dateStr: string): boolean {
  // "YYYY-MM-DD" → Date 파싱 시 UTC 기준이 되므로 로컬 보정
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

function prevWorkday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  do {
    dt.setDate(dt.getDate() - 1);
  } while (isWeekend(dt.toISOString().slice(0, 10)));
  return dt.toISOString().slice(0, 10);
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

  // 마일스톤 여부
  const isMilestone = [7, 30, 100, 365].includes(streak.count);

  return { streak, markComplete, isMilestone };
}
