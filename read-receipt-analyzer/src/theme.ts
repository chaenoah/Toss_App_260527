// 디자인 토큰 & 온도 기반 색상 계산

// 기본 팔레트 (TDS 톤: 흰 배경, 토스 블루 포인트)
export const palette = {
  tossBlue: "#3182F6",
  ink: "#191F28", // 진한 텍스트
  gray600: "#4E5968",
  gray400: "#8B95A1",
  gray200: "#E5E8EB",
  gray100: "#F2F4F6",
  white: "#FFFFFF",
};

// 온도 양 끝 색상: 낮음=블루그레이, 높음=코랄
const COLD: RGB = { r: 139, g: 149, b: 161 }; // #8B95A1 블루그레이
const HOT: RGB = { r: 255, g: 91, b: 87 }; // #FF5B57 코랄

interface RGB {
  r: number;
  g: number;
  b: number;
}

// 두 색을 t(0~1)로 선형 보간
function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function rgbToHex({ r, g, b }: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

// 온도(0~100)에 대응하는 색상 세트를 반환.
// - accent: 게이지/포인트 색
// - bg: 결과 화면 배경 (accent를 아주 옅게 깐 느낌)
// - soft: 카드 안쪽 옅은 배경
export function temperatureColors(temp: number) {
  const t = Math.max(0, Math.min(100, temp)) / 100;
  const accent: RGB = {
    r: lerp(COLD.r, HOT.r, t),
    g: lerp(COLD.g, HOT.g, t),
    b: lerp(COLD.b, HOT.b, t),
  };
  const accentHex = rgbToHex(accent);
  return {
    accent: accentHex,
    // 배경은 accent를 흰색과 92% 섞어 아주 옅게
    bg: rgbToHex({
      r: lerp(accent.r, 255, 0.9),
      g: lerp(accent.g, 255, 0.9),
      b: lerp(accent.b, 255, 0.9),
    }),
    soft: rgbToHex({
      r: lerp(accent.r, 255, 0.82),
      g: lerp(accent.g, 255, 0.82),
      b: lerp(accent.b, 255, 0.82),
    }),
  };
}
