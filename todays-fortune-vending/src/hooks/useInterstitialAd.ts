// 전면(인터스티셜) 광고 훅.
//
// 결과 화면 진입 시 1회 노출하되, 하루 노출 상한(ADS.interstitialDailyCap)을 지켜
// 과도한 광고로 인한 앱 리뷰 반려를 예방해요.
import { useCallback } from "react";
import { ADS } from "../config/ads";
import { dateKey } from "../utils/date";
import { loadItem, saveItem } from "../sdk";
import { fullScreenAdSupported, runFullScreenAd } from "./fullScreenAd";

async function withinDailyCap(): Promise<boolean> {
  const key = `ad-interstitial-${dateKey()}`;
  const shown = Number((await loadItem(key)) ?? "0");
  if (shown >= ADS.interstitialDailyCap) return false;
  await saveItem(key, String(shown + 1));
  return true;
}

export function useInterstitialAd() {
  /** 빈도 제한을 지키며 전면 광고를 1회 노출해요. */
  const maybeShowInterstitial = useCallback(async (): Promise<void> => {
    if (!ADS.enabled || !ADS.interstitialAdGroupId || !fullScreenAdSupported()) return;
    if (!(await withinDailyCap())) return;
    await runFullScreenAd(ADS.interstitialAdGroupId);
  }, []);

  return { maybeShowInterstitial };
}
