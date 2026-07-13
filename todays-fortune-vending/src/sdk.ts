// 앱인토스(web-framework) 브릿지 API 얇은 래퍼.
//
// Storage / generateHapticFeedback / share / saveBase64Data / getServerTime 같은
// 브릿지 함수는 토스 앱 WebView 안에서만 실제로 동작해요. 일반 브라우저(vite dev/preview)
// 에서는 예외가 날 수 있으므로 try/catch 로 감싸고, 저장소는 localStorage 로 폴백해서
// 어디서든 앱이 동작하게 해요.
import {
  Storage,
  generateHapticFeedback,
  share as tossShare,
  saveBase64Data,
  getServerTime,
} from "@apps-in-toss/web-framework";

type HapticType =
  | "tickWeak"
  | "tap"
  | "tickMedium"
  | "softMedium"
  | "basicWeak"
  | "basicMedium"
  | "success"
  | "error"
  | "wiggle"
  | "confetti";

/** 토스 로컬 저장소에 저장. 실패하면 localStorage 로 폴백해요. */
export async function saveItem(key: string, value: string): Promise<void> {
  try {
    await Storage.setItem(key, value);
  } catch {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* 저장 실패는 조용히 무시 */
    }
  }
}

/** 토스 로컬 저장소에서 읽기. 실패하면 localStorage 로 폴백해요. */
export async function loadItem(key: string): Promise<string | null> {
  try {
    const v = await Storage.getItem(key);
    if (v != null) return v;
  } catch {
    /* 폴백으로 진행 */
  }
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** 햅틱 진동. 토스 앱 밖(브라우저)에서는 조용히 무시돼요. */
export function haptic(type: HapticType): void {
  try {
    const result = generateHapticFeedback({ type }) as unknown;
    if (result && typeof (result as Promise<void>).then === "function") {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    /* 브라우저에서는 지원되지 않을 수 있어요 */
  }
}

/** 네이티브 공유 시트로 텍스트/링크를 공유해요. 성공 여부를 반환해요. */
export async function shareMessage(message: string): Promise<boolean> {
  try {
    await tossShare({ message });
    return true;
  } catch {
    // 브라우저 폴백: Web Share API → 클립보드
    try {
      if (navigator.share) {
        await navigator.share({ text: message });
        return true;
      }
      await navigator.clipboard.writeText(message);
      return true;
    } catch {
      return false;
    }
  }
}

/** Base64(dataURL 제외) 이미지를 기기 앨범에 저장해요. */
export async function saveImage(base64: string, fileName: string): Promise<boolean> {
  try {
    await saveBase64Data({ data: base64, fileName, mimeType: "image/png" });
    return true;
  } catch {
    return false;
  }
}

/** 서버 시간(ms). 실패하면 로컬 시각으로 폴백해요. (streak/자정 판정용) */
export async function serverNow(): Promise<number> {
  try {
    const t = await getServerTime();
    if (typeof t === "number" && t > 0) return t;
  } catch {
    /* 폴백 */
  }
  return Date.now();
}
