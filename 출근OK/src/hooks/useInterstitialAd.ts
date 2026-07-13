import { useCallback, useEffect, useRef } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-bridge';
import { trackAd, errMessage } from '../lib/adTracking';

const INTERSTITIAL_AD_GROUP_ID = 'ait.v2.live.8898421fe1154a09';

/** 노출 직전 로드 대기 상한 (유저를 오래 붙잡지 않도록 짧게) */
const MAX_WAIT_MS = 1500;
const POLL_MS = 150;

/**
 * 세션(앱 로드) 단위 1회 노출 제한.
 * 모듈 스코프 변수라 새 세션(새 앱 로드)마다 자동으로 false로 리셋됨.
 */
let shownThisSession = false;

/**
 * 전면광고 훅
 * - 앱 첫 마운트 시 프리로드
 * - showIfReady(): 로드돼 있으면 즉시 노출, 아니면 최대 1.5초 대기 후에도
 *   안 되면 스킵. 세션당 최대 1회.
 * - 모든 단계 트래킹 (콘솔에서 어디서 새는지 확인 가능)
 */
export function useInterstitialAd() {
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const cleanupRef = useRef<null | (() => void)>(null);

  const preload = useCallback(() => {
    if (!loadFullScreenAd.isSupported()) {
      trackAd('interstitial', 'load_fail', { reason: 'unsupported' });
      return;
    }
    if (loadingRef.current || loadedRef.current) return;

    loadingRef.current = true;
    trackAd('interstitial', 'load_request');

    cleanupRef.current = loadFullScreenAd({
      options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
      onEvent: (e) => {
        if (e.type === 'loaded') {
          loadedRef.current = true;
          loadingRef.current = false;
          trackAd('interstitial', 'load_success');
        }
      },
      onError: (err) => {
        loadingRef.current = false;
        trackAd('interstitial', 'load_fail', { message: errMessage(err) });
      },
    });
  }, []);

  useEffect(() => {
    preload();
    return () => {
      cleanupRef.current?.();
    };
  }, [preload]);

  /**
   * 전면광고 노출 시도. 광고 흐름이 끝나거나(닫힘/실패) 스킵되면 resolve.
   * 호출부는 이 Promise가 끝난 뒤 다음 UI(완료 모달 등)를 띄우면 됨.
   */
  const showIfReady = useCallback(async (): Promise<void> => {
    if (shownThisSession) {
      trackAd('interstitial', 'show_skip', { reason: 'already_shown_this_session' });
      return;
    }
    if (!showFullScreenAd.isSupported()) {
      trackAd('interstitial', 'show_skip', { reason: 'unsupported' });
      return;
    }

    // 아직 로드 안 됐으면 짧게 대기 (최대 MAX_WAIT_MS)
    if (!loadedRef.current) {
      const start = Date.now();
      while (!loadedRef.current && Date.now() - start < MAX_WAIT_MS) {
        await new Promise((r) => setTimeout(r, POLL_MS));
      }
    }

    if (!loadedRef.current) {
      trackAd('interstitial', 'show_skip', { reason: 'not_loaded_in_time' });
      return;
    }

    shownThisSession = true;
    trackAd('interstitial', 'show_request');

    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (!settled) {
          settled = true;
          resolve();
        }
      };
      showFullScreenAd({
        options: { adGroupId: INTERSTITIAL_AD_GROUP_ID },
        onEvent: (e) => {
          switch (e.type) {
            case 'impression':
              trackAd('interstitial', 'impression');
              break;
            case 'clicked':
              trackAd('interstitial', 'clicked');
              break;
            case 'failedToShow':
              trackAd('interstitial', 'failed_to_show', { reason: 'event' });
              done();
              break;
            case 'dismissed':
              trackAd('interstitial', 'dismissed');
              done();
              break;
          }
        },
        onError: (err) => {
          trackAd('interstitial', 'failed_to_show', { message: errMessage(err) });
          done();
        },
      });
    });
  }, []);

  return { showIfReady };
}
