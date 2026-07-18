import { getServerTime, grantPromotionReward } from "@apps-in-toss/web-framework";
import type { Promotion } from "../appConfig";

// 프로모션 리워드 지급 + '1일 1회' 제한 로직.
//
// 1일 1회 판정은 기기 시간이 아니라 토스 '서버 시간'(getServerTime) 기준 KST 날짜로 한다.
// (기기 시간 조작으로 중복 수령하는 치팅을 막기 위함. 서버시간 미지원 버전은 기기 시간으로 폴백)
// 참여 기록은 localStorage에 'promo_claimed:<code>' → 'YYYY-MM-DD'(KST) 로 저장한다.

const STORAGE_PREFIX = "promo_claimed:";

// Unix ms → KST(Asia/Seoul) 기준 'YYYY-MM-DD' 문자열
function toKSTDateKey(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

// 오늘 날짜 키. 서버 시간 우선, 실패/미지원 시 기기 시간으로 폴백.
async function getTodayKey(): Promise<string> {
  try {
    if (getServerTime.isSupported?.()) {
      const t = await getServerTime();
      if (typeof t === "number") return toKSTDateKey(t);
    }
  } catch {
    // 무시하고 기기 시간 폴백
  }
  return toKSTDateKey(Date.now());
}

// 오늘 이미 참여했는지 확인
export async function hasClaimedToday(code: string): Promise<boolean> {
  try {
    const today = await getTodayKey();
    return localStorage.getItem(STORAGE_PREFIX + code) === today;
  } catch {
    return false;
  }
}

// 오늘 참여한 것으로 기록
async function markClaimedToday(code: string): Promise<void> {
  try {
    const today = await getTodayKey();
    localStorage.setItem(STORAGE_PREFIX + code, today);
  } catch {
    // localStorage 불가 환경은 무시(서버측 중복 방지에 의존)
  }
}

export type ClaimResult =
  | "success" // 지급 성공
  | "already" // 오늘 이미 참여함(1일 1회 소진)
  | "unsupported" // 앱 버전 미지원
  | "error"; // 지급 실패

export interface ClaimOutcome {
  result: ClaimResult;
  message?: string;
}

// 프로모션 리워드 지급 시도. 1일 1회 제한을 먼저 검사한 뒤 지급한다.
export async function claimPromotion(promo: Promotion): Promise<ClaimOutcome> {
  // 1) 클라이언트 측 1일 1회 제한
  if (await hasClaimedToday(promo.code)) {
    return { result: "already" };
  }

  // 2) 리워드 지급 요청
  let res: Awaited<ReturnType<typeof grantPromotionReward>>;
  try {
    res = await grantPromotionReward({
      params: { promotionCode: promo.code, amount: promo.amount },
    });
  } catch {
    return { result: "error", message: "네트워크 오류가 발생했어요" };
  }

  if (res == null) return { result: "unsupported" };
  if (res === "ERROR") return { result: "error" };

  // 성공: 리워드 키 반환
  if ("key" in res) {
    await markClaimedToday(promo.code);
    return { result: "success" };
  }

  // 실패 응답 처리
  if ("errorCode" in res) {
    // 이미 지급(4113)/1회 한도 초과(4114)는 서버 기준으로도 '오늘 소진'으로 간주
    if (res.errorCode === "4113" || res.errorCode === "4114") {
      await markClaimedToday(promo.code);
      return { result: "already" };
    }
    return { result: "error", message: res.message };
  }

  return { result: "error" };
}
