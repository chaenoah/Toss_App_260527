// 시드 기반 결정론적 난수 유틸.
// 같은 시드(예: 생년월일+날짜)면 항상 같은 값을 내서 "오늘의" 운세를 재현해요.

/** 문자열 → 32bit 정수 해시 */
export function hashString(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** mulberry32: 시드 하나로 0~1 난수를 재현성 있게 생성해요. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 시드 문자열로 난수 생성기를 만들어요. */
export function seededRng(seed: string): () => number {
  return mulberry32(hashString(seed));
}
