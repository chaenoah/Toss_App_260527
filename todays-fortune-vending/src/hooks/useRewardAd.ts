// 리워드 광고 훅.
//
// 실제 앱인토스 전면(리워드) 광고 API(loadFullScreenAd → showFullScreenAd)에 연결돼 있어요.
// 콘솔에서 광고 그룹을 만들고 config/ads.ts 에 ID를 채우면 실제 광고가 노출돼요.
// 미설정/미지원(브라우저 등)에서는 안전하게 no-op 으로 동작해요.
//
// ⚠️ Phase 1 인터페이스: 광고 이벤트(리워드 지급 시점 등) 상세 처리는 광고 문서 기준으로
//    정교화가 필요해요. 지금은 "노출 성공 = 리워드 완료"로 단순화했어요.
import { useCallback } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { ADS } from "../config/ads";
import { track } from "../utils/eventTracking";

type LoadArgs = Parameters<typeof loadFullScreenAd>[0];

function isSupported(): boolean {
  try {
    return (
      typeof showFullScreenAd?.isSupported === "function" &&
      showFullScreenAd.isSupported()
    );
  } catch {
    return false;
  }
}

export function useRewardAd() {
  /** 리워드 광고를 노출하고, 보상 획득 여부(완료)를 반환해요. */
  const showRewardedAd = useCallback(async (): Promise<boolean> => {
    // 미설정/미지원 → 개발 중엔 데모를 위해 성공 처리, 운영에선 실패로 처리해요.
    if (!ADS.enabled || !ADS.rewardedAdGroupId || !isSupported()) {
      return import.meta.env.DEV;
    }

    const completed = await new Promise<boolean>((resolve) => {
      const loadArgs = {
        onError: () => resolve(false),
        onEvent: () => {
          const showArgs = {
            onError: () => resolve(false),
            onEvent: () => resolve(true),
            options: { adGroupId: ADS.rewardedAdGroupId },
          } as unknown as LoadArgs;
          showFullScreenAd(showArgs);
        },
        options: { adGroupId: ADS.rewardedAdGroupId },
      } as unknown as LoadArgs;
      loadFullScreenAd(loadArgs);
    });

    if (completed) track("reward_ad_watched");
    return completed;
  }, []);

  return { showRewardedAd, isSupported: isSupported() };
}
