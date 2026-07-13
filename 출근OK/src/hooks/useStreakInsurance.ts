import { useCallback, useState } from 'react';
import type { StreakData } from '../types';
import { prevWorkday } from './useStreak';
import { useRewardAdSlot } from './useRewardAdSlot';
import { loadInsuranceUses, saveInsuranceUses, insuranceUsesThisMonth } from '../lib/storage';
import { trackEvent } from '../lib/adTracking';

/**
 * TODO(콘솔): "스트릭 보험" 전용 리워드 광고그룹을 새로 발급받아 이 값으로 교체하세요.
 * 지금은 기존 옷차림 리워드 광고그룹 ID를 임시로 재사용합니다.
 * (동작은 하지만 광고 분석이 옷차림 리워드와 섞이므로, 전용 그룹 발급을 권장합니다.)
 */
const STREAK_INSURANCE_AD_GROUP_ID = 'ait.v2.live.becc31f22b064178';

/** 월 최대 사용 횟수 */
const MONTHLY_LIMIT = 2;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * 스트릭 보험 훅.
 * - atRisk: 직전 평일 출근 체크를 놓쳐 연속 기록이 끊길 상황인지
 * - canUse: atRisk이면서 이번 달 사용 한도(2회)가 남았는지
 * - watchToProtect(): 리워드 광고 시청 → 보상 획득 시 스트릭 복구
 * - 광고는 useRewardAdSlot이 마운트 시점에 프리로드
 */
export function useStreakInsurance(streak: StreakData, restoreStreak: () => void) {
  const { show } = useRewardAdSlot(STREAK_INSURANCE_AD_GROUP_ID, 'streak_insurance');
  const [usesThisMonth, setUsesThisMonth] = useState(() => insuranceUsesThisMonth());
  const [watching, setWatching] = useState(false);

  const today = todayStr();
  const pw = prevWorkday(today);

  // 연속 기록이 있고, 직전 평일을 놓쳤고(마지막 완료일이 직전 평일보다 이전),
  // 오늘은 아직 완료하지 않은 상태 → 지금 완료하면 스트릭이 끊길 위험
  const atRisk =
    streak.count > 0 &&
    streak.lastCompletedDate != null &&
    streak.lastCompletedDate < pw &&
    !streak.completedDates.includes(today);

  const canUse = atRisk && usesThisMonth < MONTHLY_LIMIT;

  const watchToProtect = useCallback(async () => {
    if (!canUse) return;
    setWatching(true);
    const earned = await show();
    setWatching(false);
    if (!earned) return;

    restoreStreak();
    const uses = [...loadInsuranceUses(), today];
    saveInsuranceUses(uses);
    setUsesThisMonth(insuranceUsesThisMonth());
    trackEvent('streak_insurance_used', {
      streak_before: streak.count,
      uses_this_month: usesThisMonth + 1,
    });
  }, [canUse, show, restoreStreak, today, streak.count, usesThisMonth]);

  return { atRisk, canUse, usesThisMonth, monthlyLimit: MONTHLY_LIMIT, watching, watchToProtect };
}
