// 리워드 광고 훅.
//
// 콘솔에서 광고 그룹을 만들고 config/ads.ts 에 ID를 채우면 실제 광고가 노출돼요.
// 미설정/미지원(브라우저 등)에서는 안전하게 no-op 으로 동작해요.
import { useCallback } from "react";
import { ADS } from "../config/ads";
import { track } from "../utils/eventTracking";
import { fullScreenAdSupported, runFullScreenAd } from "./fullScreenAd";

export function useRewardAd() {
  /** 리워드 광고를 노출하고, 보상 획득 여부를 반환해요. */
  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    // 미설정/미지원 → 개발 중엔 데모를 위해 성공 처리, 운영에선 실패로 처리해요.
    if (!ADS.enabled || !ADS.rewardedAdGroupId || !fullScreenAdSupported()) {
      return import.meta.env.DEV;
    }
    const { rewarded } = await runFullScreenAd(ADS.rewardedAdGroupId);
    if (rewarded) track("reward_ad_watched");
    return rewarded;
  }, []);

  return { showRewardedAd, supported: fullScreenAdSupported() };
}
