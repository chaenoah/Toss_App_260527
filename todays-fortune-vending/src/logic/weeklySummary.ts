// 이번 주(월~일) 재물운 총평. 주말 특집 화면에서 사용해요.
// 각 날짜의 재물운을 결정론적으로 계산해 평균/베스트/워스트를 뽑아요.
import { getFortune } from "./fortuneEngine";
import { weekDates, weekdayLabel } from "../utils/date";

export interface DaySummary {
  date: string;
  label: string; // 요일 (월~일)
  score: number;
  grade: string;
  isToday: boolean;
}

export interface WeeklySummary {
  days: DaySummary[];
  avg: number;
  best: DaySummary;
  worst: DaySummary;
  comment: string;
}

function weeklyComment(avg: number, best: DaySummary): string {
  if (avg >= 72)
    return `이번 주는 지갑에 볕들 날이 많아요. 특히 ${best.label}요일에 기회가 크게 열려요!`;
  if (avg >= 55)
    return `무난하게 흐르는 한 주예요. ${best.label}요일을 노려 한 방을 준비해봐요.`;
  if (avg >= 42)
    return `기복이 있는 주간이에요. 큰 지출은 ${best.label}요일 이후로 미뤄봐요.`;
  return `방어가 중요한 한 주예요. ${best.label}요일 하루만큼은 기회를 살려봐요.`;
}

/** 생년월일 기준으로 이번 주 재물운 총평을 계산해요. */
export function getWeeklySummary(birth: string, today: string): WeeklySummary {
  const days: DaySummary[] = weekDates(today).map((dk) => {
    const f = getFortune(birth, dk);
    return {
      date: dk,
      label: weekdayLabel(dk),
      score: f.score,
      grade: f.grade,
      isToday: dk === today,
    };
  });

  const avg = Math.round(days.reduce((s, d) => s + d.score, 0) / days.length);
  const best = days.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = days.reduce((a, b) => (b.score < a.score ? b : a));

  return { days, avg, best, worst, comment: weeklyComment(avg, best) };
}
