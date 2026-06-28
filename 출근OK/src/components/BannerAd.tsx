import { useEffect, useRef } from 'react';
import { TossAds } from '@apps-in-toss/web-bridge';

const BANNER_AD_GROUP_ID = 'ait.v2.live.ad0d9a24a68947fa';

export function BannerAd() {
  const ref = useRef<HTMLDivElement>(null);
  const destroyRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!TossAds.attachBanner.isSupported()) return;

    TossAds.initialize({});
    const result = TossAds.attachBanner(BANNER_AD_GROUP_ID, ref.current, {
      theme: 'auto',
    });
    destroyRef.current = result.destroy;

    return () => { destroyRef.current?.(); };
  }, []);

  if (!TossAds.attachBanner.isSupported()) return null;

  return <div className="banner-ad" ref={ref} />;
}
