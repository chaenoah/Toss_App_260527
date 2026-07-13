// 커스텀 이벤트 트래킹 래퍼. 앱인토스 eventLog 로 기록해요.
// 샌드박스에서는 콘솔에, 실제 환경에서는 로그 시스템에 남아요.
import { eventLog } from "@apps-in-toss/web-framework";

export type AppEvent =
  | "app_open"
  | "onboarding_completed"
  | "result_generated"
  | "card_shared"
  | "reward_ad_watched"
  | "streak_recovered"
  | "detail_report_unlocked";

type Params = Record<string, string | number | boolean | null | undefined>;

/** 이벤트 기록. 실패해도 앱 흐름에 영향을 주지 않아요. */
export function track(event: AppEvent, params: Params = {}): void {
  try {
    const p = eventLog({
      log_name: event,
      log_type: "event",
      params,
    }) as unknown;
    if (p && typeof (p as Promise<void>).then === "function") {
      (p as Promise<void>).catch(() => {});
    }
  } catch {
    // 브라우저 개발 환경 등에서는 콘솔로만 남겨요.
    if (import.meta.env.DEV) {
      console.debug("[track]", event, params);
    }
  }
}
