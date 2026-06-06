import { useState, useCallback } from 'react';
import type { StreakData } from '../types';
import { loadStreak, saveStreak } from '../lib/storage';

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(() => loadStreak());

  const markComplete = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (streak.completedDates.includes(today)) return; // 이미 완료

    const yday = yesterday();
    const prevCompleted =
      streak.completedDates.includes(yday) || isWeekend(yday);
    const newCount = prevCompleted ? streak.count + 1 : 1;

    const next: StreakData = {
      count: newCount,
      lastCompletedDate: today,
      completedDates: [...streak.completedDates, today],
    };
    saveStreak(next);
    setStreak(next);
  }, [streak]);

  return { streak, markComplete };
}
