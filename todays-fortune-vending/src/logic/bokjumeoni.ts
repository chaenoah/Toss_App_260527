// 복주머니(인앱 수집 재화) 관리.
//
// - 공유 시 하루 1회 복주머니 +1 (어뷰징 방지: 일 1회 캡)
// - 복주머니로 상세 재물운 리포트를 열 수 있어요(광고 대체 수단).
import { dateKey } from "../utils/date";
import { loadItem, saveItem } from "../sdk";

const KEY = "bokjumeoni";

export async function getBokjumeoni(): Promise<number> {
  const raw = await loadItem(KEY);
  const n = Number(raw ?? "0");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function addBokjumeoni(n = 1): Promise<number> {
  const next = (await getBokjumeoni()) + n;
  await saveItem(KEY, String(next));
  return next;
}

/** 복주머니 n개를 사용해요. 부족하면 false. */
export async function spendBokjumeoni(n = 1): Promise<boolean> {
  const cur = await getBokjumeoni();
  if (cur < n) return false;
  await saveItem(KEY, String(cur - n));
  return true;
}

/**
 * 공유 보상: 하루 1회만 복주머니 +1 을 지급해요.
 * 지급했으면 true(+ 갱신된 개수), 오늘 이미 받았으면 false 를 반환해요.
 */
export async function grantShareRewardOncePerDay(): Promise<{
  granted: boolean;
  count: number;
}> {
  const flagKey = `share-reward-${dateKey()}`;
  const already = await loadItem(flagKey);
  if (already) {
    return { granted: false, count: await getBokjumeoni() };
  }
  await saveItem(flagKey, "1");
  const count = await addBokjumeoni(1);
  return { granted: true, count };
}
