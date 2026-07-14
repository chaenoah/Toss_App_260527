import { grantPromotionReward } from '@apps-in-toss/web-bridge';
import { trackEvent } from './adTracking';

/**
 * 프로모션(토스포인트) 지급 공통 모듈.
 * 정확한 API: @apps-in-toss/web-bridge 의 grantPromotionReward (SDK v2.6.1 검증).
 *   grantPromotionReward({ params: { promotionCode, amount } })
 *     → { key } 성공 | { errorCode, message } 실패 | 'ERROR' | undefined(버전 미지원)
 */

// ⚠️ 테스트 모드: true면 TEST_ 코드, false면 라이브 코드 사용.
// 반드시 테스트 코드로 검증 후 false로 전환할 것.
export const IS_PROMO_TEST = true;

export const REWARD_AMOUNT = 10; // 10원

// 프로모션별 디스크립터 (test/live 코드 + 중복방지 storageKey)
export const PROMOS = {
  // 미션1: 출근 체크리스트 완료
  checkin: {
    live: '01KXG0MC8DM131FMQG4EREX117',
    test: 'TEST_01KXG0MC8DM131FMQG4EREX117',
    storageKey: 'promo_checkin_claimed',
  },
  // 미션2: 옷차림 추천받기(리워드 광고 시청)
  outfit: {
    live: '01KXG0Q3DSPNNWPFYESYHQ0A29',
    test: 'TEST_01KXG0Q3DSPNNWPFYESYHQ0A29',
    storageKey: 'promo_outfit_claimed',
  },
} as const;

export type PromoName = keyof typeof PROMOS;
export type PromoResult = 'granted' | 'already' | 'failed';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function promoCode(name: PromoName): string {
  const p = PROMOS[name];
  return IS_PROMO_TEST ? p.test : p.live;
}

/** 오늘 이미 지급받았는지 */
export function isPromoClaimedToday(name: PromoName): boolean {
  return localStorage.getItem(PROMOS[name].storageKey) === todayStr();
}

// 진행 중 중복 클릭/호출 방지 (storageKey 단위)
const inFlight = new Set<string>();

/**
 * 프로모션 포인트 지급 공통 함수.
 * - 중복 방지: 오늘 이미 지급했으면 API 미호출('already')
 * - 성공(`{key}`) 시에만 날짜 기록 → 실패 시 재시도 가능
 * - 진행 중 중복 클릭 차단
 * - 성공/실패/중복차단 각각 트래킹
 */
export async function claimPromotion(name: PromoName): Promise<PromoResult> {
  const { storageKey } = PROMOS[name];
  const today = todayStr();

  // 1) 오늘 이미 지급 → API 호출 없이 선차단
  if (localStorage.getItem(storageKey) === today) {
    trackEvent('promo_dup_blocked', { promo: name });
    return 'already';
  }

  // 2) 진행 중이면 중복 클릭 차단
  if (inFlight.has(storageKey)) {
    return 'failed';
  }
  inFlight.add(storageKey);

  try {
    const result = await grantPromotionReward({
      params: { promotionCode: promoCode(name), amount: REWARD_AMOUNT },
    });

    // 성공: { key: string }
    if (result != null && typeof result === 'object' && 'key' in result) {
      localStorage.setItem(storageKey, today); // 성공 시에만 기록
      trackEvent('promo_granted', { promo: name, amount: REWARD_AMOUNT });
      return 'granted';
    }

    // 실패: { errorCode, message } | 'ERROR' | undefined(버전 미지원)
    const errorCode =
      result != null && typeof result === 'object' && 'errorCode' in result
        ? String(result.errorCode)
        : result === undefined
          ? 'UNSUPPORTED_VERSION'
          : 'ERROR';
    trackEvent('promo_failed', { promo: name, error_code: errorCode });
    // 완료 경험을 깨지 않도록 에러 모달 대신 콘솔 로그만 남김
    console.warn('[promo] grant failed:', name, result);
    return 'failed';
  } catch (e) {
    trackEvent('promo_failed', { promo: name, error_code: 'EXCEPTION' });
    console.warn('[promo] grant exception:', name, e);
    return 'failed';
  } finally {
    inFlight.delete(storageKey);
  }
}
