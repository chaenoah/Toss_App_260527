import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-bridge';

const REWARD_AD_GROUP_ID = ''; // 리워드 광고 ID (추후 입력)
const UNLOCK_KEY = 'outfit_unlocked_date';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isUnlockedToday() {
  return localStorage.getItem(UNLOCK_KEY) === todayStr();
}

export function useRewardAd() {
  const [unlocked, setUnlocked] = useState(() => isUnlockedToday());
  const [watching, setWatching] = useState(false);
  const adLoaded = useRef(false);

  // 광고 미리 로드 (ID가 있을 때만)
  useEffect(() => {
    if (!REWARD_AD_GROUP_ID) return;
    if (unlocked) return;
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) return;

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: REWARD_AD_GROUP_ID },
      onEvent: (e) => { if (e.type === 'loaded') adLoaded.current = true; },
      onError: () => {},
    });
    return cleanup;
  }, [unlocked]);

  const watchAd = useCallback(() => {
    // 리워드 광고 ID가 없으면 즉시 해제 (개발/테스트 환경)
    if (!REWARD_AD_GROUP_ID) {
      localStorage.setItem(UNLOCK_KEY, todayStr());
      setUnlocked(true);
      return;
    }

    if (!GoogleAdMob.showAppsInTossAdMob.isSupported()) {
      alert('이 환경에서는 리워드 광고가 지원되지 않아요.');
      return;
    }

    setWatching(true);
    GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId: REWARD_AD_GROUP_ID },
      onEvent: (e) => {
        if (e.type === 'userEarnedReward') {
          localStorage.setItem(UNLOCK_KEY, todayStr());
          setUnlocked(true);
        }
        if (e.type === 'dismissed' || e.type === 'failedToShow') {
          setWatching(false);
        }
      },
      onError: () => setWatching(false),
    });
  }, []);

  return { unlocked, watching, watchAd };
}
