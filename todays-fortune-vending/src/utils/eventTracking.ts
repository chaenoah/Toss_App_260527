// 커스텀 이벤트 트래킹 래퍼. 앱인토스 eventLog 로 기록해요.
// 샌드박스에서는 콘솔에, 실제 환경에서는 로그 시스템에 남아요.
import { eventLog } from "@apps-in-toss/web-framework";

export type AppEvent =
  | "app_open"
  | "screen_view"
  | "onboarding_completed"
  | "result_generated"
  | "card_shared"
  | "share_reward_granted"
  | "reward_ad_watched"
  | "streak_recovered"
  | "detail_report_unlocked"
  | "bokjumeoni_spent"
  | "weekend_summary_viewed";

type LogType = "event" | "screen" | "click" | "impression" | "info";
type Params = Record<string, string | number | boolean | null | undefined>;

/** 이벤트 기록. 실패해도 앱 흐름에 영향을 주지 않아요. */
export function track(event: AppEvent, params: Params = {}, logType: LogType = "event"): void {
  try {
    const p = eventLog({ log_name: event, log_type: logType, params }) as unknown;
    if (p && typeof (p as Promise<void>).then === "function") {
      (p as Promise<void>).catch(() => {});
    }
  } catch {
    if (import.meta.env.DEV) {
      console.debug("[track]", event, params);
    }
  }
}

/** 화면 조회 이벤트 헬퍼 */
export function trackScreen(screen: string): void {
  track("screen_view", { screen }, "screen");
}
