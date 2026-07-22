import { grantPromotionReward } from '@apps-in-toss/web-bridge';
import { trackEvent } from './adTracking';

/**
 * 프로모션(토스포인트) 지급 공통 모듈.
 * 정확한 API: @apps-in-toss/web-bridge 의 grantPromotionReward (SDK v2.6.1 검증).
 *   grantPromotionReward({ params: { promotionCode, amount } })
 *     → { key } 성공 | { errorCode, message } 실패 | 'ERROR' | undefined(버전 미지원)
 */

// ⚠️ 테스트 모드: true면 TEST_ 코드, false면 라이브 코드 사용.
// 테스트 검증 완료 → 라이브(실지급)로 전환.
export const IS_PROMO_TEST = false;

// 프로모션별 디스크립터 (test/live 코드 + 지급 금액 + 중복방지 storageKey)
// ⚠️ amount는 반드시 콘솔에 설정된 "1회 지급 금액"과 일치해야 함.
//    불일치 시 grantPromotionReward가 에러코드 4114(금액 초과)로 실패함.
export const PROMOS = {
  // 미션1: 출근 준비물 챙기기(체크리스트 완료) — 1원
  checkin: {
    live: '01KY3FZGYD8VHZM9WHWPRJZ82V',
    test: 'TEST_01KY3FZGYD8VHZM9WHWPRJZ82V',
    amount: 1,
    storageKey: 'promo_checkin_claimed',
  },
  // 미션2: 옷차림 추천받기(리워드 광고 시청) — 10원
  outfit: {
    live: '01KY3FY5AJ0GTRNVH21BA9FX83',
    test: 'TEST_01KY3FY5AJ0GTRNVH21BA9FX83',
    amount: 10,
    storageKey: 'promo_outfit_claimed',
  },
} as const;

export type PromoName = keyof typeof PROMOS;
export type PromoResult = 'granted' | 'already' | 'failed';

/** 지급 결과 + (실패 시) 에러코드 — 테스트 진단용 */
export interface PromoClaim {
  result: PromoResult;
  errorCode?: string;
}

/** 미션별 지급 금액(원) */
export function promoAmount(name: PromoName): number {
  return PROMOS[name].amount;
}

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
export async function claimPromotion(name: PromoName): Promise<PromoClaim> {
  const { storageKey, amount } = PROMOS[name];
  const today = todayStr();

  // 1) 오늘 이미 지급 → API 호출 없이 선차단
  if (localStorage.getItem(storageKey) === today) {
    trackEvent('promo_dup_blocked', { promo: name });
    return { result: 'already' };
  }

  // 2) 진행 중이면 중복 클릭 차단
  if (inFlight.has(storageKey)) {
    return { result: 'failed', errorCode: 'IN_FLIGHT' };
  }
  inFlight.add(storageKey);

  try {
    const result = await grantPromotionReward({
      params: { promotionCode: promoCode(name), amount },
    });

    // 성공: { key: string }
    if (result != null && typeof result === 'object' && 'key' in result) {
      localStorage.setItem(storageKey, today); // 성공 시에만 기록
      trackEvent('promo_granted', { promo: name, amount });
      return { result: 'granted' };
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
    console.warn('[promo] grant failed:', name, 'amount=', amount, result);
    return { result: 'failed', errorCode };
  } catch (e) {
    trackEvent('promo_failed', { promo: name, error_code: 'EXCEPTION' });
    console.warn('[promo] grant exception:', name, e);
    return { result: 'failed', errorCode: 'EXCEPTION' };
  } finally {
    inFlight.delete(storageKey);
  }
}
