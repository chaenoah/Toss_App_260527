import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-bridge';
import { trackAd } from '../lib/adTracking';

const BANNER_AD_GROUP_ID = 'ait.v2.live.ad0d9a24a68947fa';

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!TossAds.attachBanner.isSupported()) return;

    TossAds.initialize({});
    trackAd('banner', 'load_request');

    const result = TossAds.attachBanner(BANNER_AD_GROUP_ID, ref.current, {
      theme: 'auto',
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

    return () => {
      destroyRef.current?.();
    };
  }, []);

  if (!TossAds.attachBanner.isSupported()) return null;

  return <div className="banner-ad" ref={ref} />;
}
