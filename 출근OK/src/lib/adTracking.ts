import { Analytics } from '@apps-in-toss/web-analytics';

/**
 * 광고 퍼널 트래킹
 * - 앱인토스 콘솔에서 log_name 기준으로 각 단계 집계 가능
 * - 요청(load_request) → 로드(load_success/fail) → 노출요청(show_request)
 *   → 노출(impression) / 스킵(show_skip) / 실패(failed_to_show) 흐름을 추적
 */

export type AdKind = 'interstitial' | 'rewarded' | 'banner';

export type AdStage =
  | 'load_request'
  | 'load_success'
  | 'load_fail'
  | 'show_request'
  | 'show_skip'
  | 'impression'
  | 'clicked'
  | 'dismissed'
  | 'failed_to_show'
  | 'reward_earned'
  | 'no_fill';

export type AdPlatform = 'ios' | 'android' | 'web';

/** 플랫폼 감지 (앱인토스는 공개 OS getter가 없어 UA로 판별 — 트래킹 라벨용) */
export function getAdPlatform(): AdPlatform {
  if (typeof navigator === 'undefined') return 'web';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'web';
}

type Extra = Record<string, string | number | boolean>;

export function trackAd(kind: AdKind, stage: AdStage, extra?: Extra): void {
  const payload = {
    log_name: `ad_${kind}_${stage}`,
    ad_kind: kind,
    ad_stage: stage,
    ad_platform: getAdPlatform(),
    ...extra,
  };
  try {
    // 커스텀 파라미터를 함께 보낼 수 있는 impression 채널 사용
    void Analytics.impression(payload);
  } catch {
    /* 트래킹 실패는 앱 동작에 영향 주지 않도록 무시 */
  }
  // 개발/디버깅 편의용 콘솔 로그 (프로덕션 콘솔에도 남아 원인 추적에 도움)
  if (stage === 'load_fail' || stage === 'failed_to_show' || stage === 'no_fill' || stage === 'show_skip') {
    // eslint-disable-next-line no-console
    console.warn('[ad]', payload);
  }
}

/** Error/unknown → 안전한 문자열 */
export function errMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch {
    return 'unknown_error';
  }
}
