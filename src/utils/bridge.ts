// Safe wrappers for Toss WebView bridge APIs.
// Falls back gracefully when running outside the Toss app.

interface TossAIT {
  haptic?: (type: string) => void;
  share?: (options: { title: string; text: string; imageDataUrl?: string }) => void;
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
    if (window.TossAIT?.toast) {
      window.TossAIT.toast(message);
    }
    // In-app toast is handled by the ToastProvider in the UI layer
  } catch {
    // silently fail
  }
}

export async function shareImage(title: string, text: string, imageDataUrl?: string): Promise<boolean> {
  try {
    if (window.TossAIT?.share) {
      window.TossAIT.share({ title, text, imageDataUrl });
      return true;
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
