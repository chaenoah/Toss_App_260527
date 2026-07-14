import { useCallback, useState } from 'react';
import { useRewardAdSlot } from './useRewardAdSlot';
import { claimPromotion } from '../lib/promotion';

const REWARD_AD_GROUP_ID = 'ait.v2.live.becc31f22b064178';
const UNLOCK_KEY = 'outfit_unlocked_date';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isUnlockedToday() {
  return localStorage.getItem(UNLOCK_KEY) === todayStr();
}

/** 날씨 카드 "옷차림 추천" 리워드 잠금해제 (하루 1회) + 프로모션 10원 지급 */
export function useRewardAd() {
  const [unlocked, setUnlocked] = useState(() => isUnlockedToday());
  const [watching, setWatching] = useState(false);
  const [pointMsg, setPointMsg] = useState<string | null>(null);
  const [notReady, setNotReady] = useState<string | null>(null);
  const { show } = useRewardAdSlot(REWARD_AD_GROUP_ID, 'outfit');

  const watchAd = useCallback(async () => {
    setNotReady(null);
    setWatching(true);
    const { earned, failed } = await show();
    setWatching(false);

    if (earned) {
      // 1) 옷차림 잠금해제 먼저
      localStorage.setItem(UNLOCK_KEY, todayStr());
      setUnlocked(true);
      // 2) 잠금해제 직후 프로모션 지급 (userEarnedReward 시점).
      //    이미 지급/실패는 조용히 스킵 — 옷차림 추천은 정상 제공됨.
      const r = await claimPromotion('outfit');
      if (r === 'granted') setPointMsg('+10원 지급 완료 💰');
    } else if (failed) {
      // 광고 로드/노출 실패 → 혜택탭 유저가 막히지 않게 인라인 안내
      setNotReady('잠시 후 다시 시도해주세요');
    }
  }, [show]);

  return { unlocked, watching, pointMsg, notReady, watchAd };
}
