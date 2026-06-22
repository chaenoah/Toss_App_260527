// Safe wrappers for Toss WebView bridge APIs.
// Falls back gracefully when running outside the Toss app.

interface TossAITShareOptions {
  title: string;
  text: string;
  url?: string;
  imageDataUrl?: string;
}

interface TossAIT {
  haptic?: (type: string) => void;
  share?: (options: TossAITShareOptions) => void;
  toast?: (message: string) => void;
}

declare global {
  interface Window {
    TossAIT?: TossAIT;
    webkit?: { messageHandlers?: Record<string, { postMessage: (m: unknown) => void }> };
  }
}

export function haptic(type: 'light' | 'medium' | 'heavy' = 'medium'): void {
  try {
    if (window.TossAIT?.haptic) {
      window.TossAIT.haptic(type);
    } else if ('vibrate' in navigator) {
      const ms = type === 'light' ? 30 : type === 'medium' ? 60 : 100;
      navigator.vibrate(ms);
    }
  } catch {
    // silently fail
  }
}

export function showToast(message: string): void {
  try {
    if (window.TossAIT?.toast) window.TossAIT.toast(message);
  } catch { /* silently fail */ }
}

/**
 * Share a prescription with optional deep link URL and image.
 * - Inside Toss app: native share sheet via TossAIT bridge (URL re-opens mini-app)
 * - Mobile browser: Web Share API
 * - Desktop / fallback: copy link + text to clipboard
 */
export async function shareImage(
  title: string,
  text: string,
  imageDataUrl?: string,
  url?: string,
): Promise<boolean> {
  try {
    if (window.TossAIT?.share) {
      window.TossAIT.share({ title, text, url, imageDataUrl });
      return true;
    }
    if (navigator.share) {
      // Some platforms reject extra fields — strip undefined
      const payload: ShareData = { title, text };
      if (url) payload.url = url;
      await navigator.share(payload);
      return true;
    }
    const clipboardText = url ? `${text}\n\n${url}` : text;
    await navigator.clipboard.writeText(clipboardText);
    return true;
  } catch {
    return false;
  }
}
