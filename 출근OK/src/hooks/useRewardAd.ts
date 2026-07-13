import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-bridge';
import { trackAd, errMessage } from '../lib/adTracking';

const REWARD_AD_GROUP_ID = 'ait.v2.live.becc31f22b064178';
const UNLOCK_KEY = 'outfit_unlocked_date';

/** 노출 직전 로드 대기 상한 (유저가 직접 눌렀으니 전면광고보다 살짝 여유) */
const MAX_WAIT_MS = 2000;
const POLL_MS = 200;

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
  const cleanupRef = useRef<null | (() => void)>(null);

  // 버튼 누르기 전에 미리 로드해두기 (미해제 상태일 때만)
  const preload = useCallback(() => {
    if (unlocked) return;
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) return;
    if (adLoaded.current) return;

    trackAd('rewarded', 'load_request');
    cleanupRef.current = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: REWARD_AD_GROUP_ID },
      onEvent: (e) => {
        if (e.type === 'loaded') {
          adLoaded.current = true;
          trackAd('rewarded', 'load_success');
        }
      },
      onError: (err) => {
        trackAd('rewarded', 'load_fail', { message: errMessage(err) });
      },
    });
  }, [unlocked]);

  useEffect(() => {
    preload();
    return () => {
      cleanupRef.current?.();
    };
  }, [preload]);

  /** SDK에 실제 로드 여부를 재확인 (프리로드 이벤트를 놓친 경우 대비) */
  const ensureLoaded = useCallback(async (): Promise<boolean> => {
    if (adLoaded.current) return true;
    const start = Date.now();
    while (Date.now() - start < MAX_WAIT_MS) {
      if (adLoaded.current) return true;
      if (GoogleAdMob.isAppsInTossAdMobLoaded.isSupported()) {
        try {
          const ok = await GoogleAdMob.isAppsInTossAdMobLoaded({ adGroupId: REWARD_AD_GROUP_ID });
          if (ok) {
            adLoaded.current = true;
            return true;
          }
        } catch {
          /* 재시도 */
        }
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    return adLoaded.current;
  }, []);

  const watchAd = useCallback(async () => {
    if (!GoogleAdMob.showAppsInTossAdMob.isSupported()) {
      trackAd('rewarded', 'show_skip', { reason: 'unsupported' });
      alert('이 환경에서는 리워드 광고가 지원되지 않아요.');
      return;
    }

    setWatching(true);

    // 프리로드가 아직 안 끝났으면 잠깐 대기 후 재확인
    const ready = await ensureLoaded();
    if (!ready) {
      trackAd('rewarded', 'show_skip', { reason: 'not_loaded_in_time' });
      setWatching(false);
      preload(); // 다음을 위해 다시 로드 시도
      alert('광고를 불러오는 중이에요. 잠시 후 다시 눌러주세요 🙏');
      return;
    }

    trackAd('rewarded', 'show_request');
    GoogleAdMob.showAppsInTossAdMob({
      options: { adGroupId: REWARD_AD_GROUP_ID },
      onEvent: (e) => {
        switch (e.type) {
          case 'impression':
            trackAd('rewarded', 'impression');
            break;
          case 'clicked':
            trackAd('rewarded', 'clicked');
            break;
          case 'userEarnedReward':
            trackAd('rewarded', 'reward_earned');
            localStorage.setItem(UNLOCK_KEY, todayStr());
            setUnlocked(true);
            break;
          case 'failedToShow':
            trackAd('rewarded', 'failed_to_show', { reason: 'event' });
            adLoaded.current = false;
            setWatching(false);
            preload();
            break;
          case 'dismissed':
            trackAd('rewarded', 'dismissed');
            adLoaded.current = false;
            setWatching(false);
            preload();
            break;
        }
      },
      onError: (err) => {
        trackAd('rewarded', 'failed_to_show', { message: errMessage(err) });
        adLoaded.current = false;
        setWatching(false);
        preload();
      },
    });
  }, [ensureLoaded, preload]);

  return { unlocked, watching, watchAd };
}
