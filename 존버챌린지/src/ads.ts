import { TossAds, loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";

const BANNER_AD_GROUP_ID = "REPLACE_ME_BANNER";
const FULLSCREEN_AD_GROUP_ID = "REPLACE_ME_FULLSCREEN";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

let adsInitialized = false;
function ensureInit() {
  if (adsInitialized) return;
  if (!safe(() => TossAds.initialize.isSupported(), false)) return;
  safe(() => TossAds.initialize({ callbacks: {} }), undefined);
  adsInitialized = true;
}

export function attachBanner(target: HTMLElement): (() => void) | null {
  if (!safe(() => TossAds.attachBanner.isSupported(), false)) return null;
  ensureInit();
  return safe(() => {
    const slot = TossAds.attachBanner(BANNER_AD_GROUP_ID, target, {
      variant: "card",
      theme: "auto",
    });
    return () => slot.destroy();
  }, null);
}

export async function showInterstitial(): Promise<void> {
  const loadOk = safe(() => loadFullScreenAd.isSupported(), false);
  const showOk = safe(() => showFullScreenAd.isSupported(), false);
  if (!loadOk || !showOk) return;

  await new Promise<void>((resolve) => {
    const done = () => resolve();
    try {
      const off = loadFullScreenAd({
        options: { adGroupId: FULLSCREEN_AD_GROUP_ID } as never,
        onEvent: (e: { type?: string }) => {
          if (e?.type === "loaded") {
            try { off(); } catch {}
            try {
              showFullScreenAd({
                options: { adGroupId: FULLSCREEN_AD_GROUP_ID } as never,
                onEvent: (se: { type?: string }) => {
                  if (se?.type === "closed" || se?.type === "dismissed") done();
                },
                onError: done,
              });
            } catch {
              done();
            }
          }
        },
        onError: done,
      });
    } catch {
      done();
    }
    setTimeout(done, 2500);
  });
}
