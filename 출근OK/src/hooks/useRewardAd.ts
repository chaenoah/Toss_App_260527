import { useCallback, useState } from 'react';
import { useRewardAdSlot } from './useRewardAdSlot';

const REWARD_AD_GROUP_ID = 'ait.v2.live.becc31f22b064178';
const UNLOCK_KEY = 'outfit_unlocked_date';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isUnlockedToday() {
  return localStorage.getItem(UNLOCK_KEY) === todayStr();
}

/** 날씨 카드 "옷차림 추천" 리워드 잠금해제 (하루 1회) */
export function useRewardAd() {
  const [unlocked, setUnlocked] = useState(() => isUnlockedToday());
  const [watching, setWatching] = useState(false);
  const { show } = useRewardAdSlot(REWARD_AD_GROUP_ID, 'outfit');

  const watchAd = useCallback(async () => {
    setWatching(true);
    const earned = await show();
    setWatching(false);
    if (earned) {
      localStorage.setItem(UNLOCK_KEY, todayStr());
      setUnlocked(true);
    } else {
      alert('광고를 불러오는 중이거나 시청이 완료되지 않았어요. 잠시 후 다시 시도해주세요 🙏');
    }
  }, [show]);

  return { unlocked, watching, watchAd };
}
