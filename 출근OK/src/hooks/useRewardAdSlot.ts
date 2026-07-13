import { useCallback, useEffect, useRef } from 'react';
import { GoogleAdMob } from '@apps-in-toss/web-bridge';
import { trackAd, errMessage } from '../lib/adTracking';

/** 노출 직전 로드 대기 상한 (유저가 직접 버튼을 눌렀으니 전면광고보다 약간 여유) */
const MAX_WAIT_MS = 2000;
const POLL_MS = 200;

/**
 * 리워드 광고 슬롯 공용 훅.
 * - 마운트 시 프리로드
 * - show(): 노출 직전 isAppsInTossAdMobLoaded로 로드 확인 → 보상 획득 여부 반환
 * - slot 파라미터로 트래킹을 구분(outfit / streak_insurance ...)
 *
 * @param adGroupId 콘솔에서 발급받은 리워드 광고그룹 ID (빈 문자열이면 비활성)
 * @param slot      트래킹 구분용 슬롯 이름
 */
export function useRewardAdSlot(adGroupId: string, slot: string) {
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const cleanupRef = useRef<null | (() => void)>(null);

  const preload = useCallback(() => {
    if (!adGroupId) return;
    if (!GoogleAdMob.loadAppsInTossAdMob.isSupported()) return;
    if (loadedRef.current || loadingRef.current) return;

    loadingRef.current = true;
    trackAd('rewarded', 'load_request', { slot });
    cleanupRef.current = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId },
      onEvent: (e) => {
        if (e.type === 'loaded') {
          loadedRef.current = true;
          loadingRef.current = false;
          trackAd('rewarded', 'load_success', { slot });
        }
      },
      onError: (err) => {
        loadingRef.current = false;
        trackAd('rewarded', 'load_fail', { slot, message: errMessage(err) });
      },
    });
  }, [adGroupId, slot]);

  useEffect(() => {
    preload();
    return () => {
      cleanupRef.current?.();
    };
  }, [preload]);

  /** 프리로드 이벤트를 놓친 경우 대비, SDK에 실제 로드 여부 재확인 */
  const ensureLoaded = useCallback(async (): Promise<boolean> => {
    if (loadedRef.current) return true;
    if (!adGroupId) return false;
    const start = Date.now();
    while (Date.now() - start < MAX_WAIT_MS) {
      if (loadedRef.current) return true;
      if (GoogleAdMob.isAppsInTossAdMobLoaded.isSupported()) {
        try {
          const ok = await GoogleAdMob.isAppsInTossAdMobLoaded({ adGroupId });
          if (ok) {
            loadedRef.current = true;
            return true;
          }
        } catch {
          /* 재시도 */
        }
      }
      await new Promise((r) => setTimeout(r, POLL_MS));
    }
    return loadedRef.current;
  }, [adGroupId]);

  /** 광고 노출. 보상 획득(userEarnedReward) 시 true, 그 외 false */
  const show = useCallback(async (): Promise<boolean> => {
    if (!GoogleAdMob.showAppsInTossAdMob.isSupported()) {
      trackAd('rewarded', 'show_skip', { slot, reason: 'unsupported' });
      return false;
    }
    const ready = await ensureLoaded();
    if (!ready) {
      trackAd('rewarded', 'show_skip', { slot, reason: 'not_loaded_in_time' });
      preload();
      return false;
    }

    trackAd('rewarded', 'show_request', { slot });
    return new Promise<boolean>((resolve) => {
      let earned = false;
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        loadedRef.current = false;
        preload(); // 다음 사용을 위해 재프리로드
        resolve(earned);
      };
      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId },
        onEvent: (e) => {
          switch (e.type) {
            case 'impression':
              trackAd('rewarded', 'impression', { slot });
              break;
            case 'clicked':
              trackAd('rewarded', 'clicked', { slot });
              break;
            case 'userEarnedReward':
              earned = true;
              trackAd('rewarded', 'reward_earned', { slot });
              break;
            case 'failedToShow':
              trackAd('rewarded', 'failed_to_show', { slot, reason: 'event' });
              done();
              break;
            case 'dismissed':
              trackAd('rewarded', 'dismissed', { slot });
              done();
              break;
          }
        },
        onError: (err) => {
          trackAd('rewarded', 'failed_to_show', { slot, message: errMessage(err) });
          done();
        },
      });
    });
  }, [adGroupId, slot, ensureLoaded, preload]);

  return { show, preload };
}
