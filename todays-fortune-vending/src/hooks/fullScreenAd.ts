// 앱인토스 전면(풀스크린) 광고 실행 공용 로직.
//
// loadFullScreenAd → showFullScreenAd 흐름을 Promise 로 감싸고, 광고 이벤트에서
// '리워드 지급'과 '닫힘'을 방어적으로 파싱해요.
//
// ⚠️ 이벤트 이름(REWARD/CLOSED 등)은 실제 광고 SDK 문서 기준으로 최종 확인이 필요해요.
//    지금은 흔히 쓰이는 키워드로 매칭하고, 알 수 없으면 '노출=완료'로 처리해요.
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";

type LoadArgs = Parameters<typeof loadFullScreenAd>[0];

export interface AdResult {
  shown: boolean;
  rewarded: boolean;
}

/** 현재 앱 버전이 전면 광고를 지원하는지 */
export function fullScreenAdSupported(): boolean {
  try {
    return (
      typeof showFullScreenAd?.isSupported === "function" &&
      showFullScreenAd.isSupported()
    );
  } catch {
    return false;
  }
}

function eventType(e: unknown): string {
  if (typeof e === "object" && e !== null && "type" in e) {
    return String((e as { type: unknown }).type).toUpperCase();
  }
  return "";
}

/** 광고를 로드→노출하고, 노출/리워드 결과를 반환해요. */
export function runFullScreenAd(adGroupId: string): Promise<AdResult> {
  return new Promise<AdResult>((resolve) => {
    let rewarded = false;

    const loadArgs = {
      onError: () => resolve({ shown: false, rewarded: false }),
      onEvent: () => {
        const showArgs = {
          onError: () => resolve({ shown: false, rewarded }),
          onEvent: (e: unknown) => {
            const type = eventType(e);
            if (type.includes("REWARD")) rewarded = true;
            // 닫힘/종료/완료 신호 또는 타입 미상 → 결과 확정
            if (
              type === "" ||
              type.includes("CLOS") ||
              type.includes("DISMISS") ||
              type.includes("COMPLETE") ||
              type.includes("FINISH")
            ) {
              resolve({ shown: true, rewarded: rewarded || type.includes("COMPLETE") });
            }
          },
          options: { adGroupId },
        } as unknown as LoadArgs;
        showFullScreenAd(showArgs);
      },
      options: { adGroupId },
    } as unknown as LoadArgs;

    loadFullScreenAd(loadArgs);
  });
}
