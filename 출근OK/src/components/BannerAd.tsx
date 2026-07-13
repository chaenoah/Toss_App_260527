import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-bridge';
import { trackAd, errMessage } from '../lib/adTracking';

const BANNER_AD_GROUP_ID = 'ait.v2.live.ad0d9a24a68947fa';

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!TossAds.attachBanner.isSupported()) return;

    let cancelled = false;
    trackAd('banner', 'load_request');

    // ⚠️ initialize()는 비동기(내부에서 광고 SDK를 동적 로드 후 init).
    // 초기화가 끝나기 전에 attachBanner()를 호출하면 SDK가 없어
    // "Call initialize() before attaching an ad" 에러로 렌더 실패 → 노출 0건.
    // 따라서 반드시 onInitialized 콜백 안에서 attachBanner를 호출한다.
    TossAds.initialize({
      callbacks: {
        onInitialized: () => {
          if (cancelled || !ref.current) return;
          const result = TossAds.attachBanner(BANNER_AD_GROUP_ID, ref.current, {
            theme: 'auto',
            variant: 'expanded',
            callbacks: {
              onAdRendered: () => trackAd('banner', 'load_success'),
              onAdImpression: () => trackAd('banner', 'impression'),
              onAdClicked: () => trackAd('banner', 'clicked'),
              onAdFailedToRender: (p) =>
                trackAd('banner', 'failed_to_show', {
                  code: p?.error?.code ?? -1,
                  message: p?.error?.message ?? 'render_failed',
                }),
              onNoFill: () => trackAd('banner', 'no_fill'),
            },
          });
          destroyRef.current = result.destroy;
        },
        onInitializationFailed: (err) => {
          trackAd('banner', 'load_fail', { message: errMessage(err) });
        },
      },
    });

    return () => {
      cancelled = true;
      destroyRef.current?.();
    };
  }, []);

  if (!TossAds.attachBanner.isSupported()) return null;

  return <div className="banner-ad" ref={ref} />;
}
