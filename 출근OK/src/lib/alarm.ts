export type AlarmPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export function getPermissionStatus(): AlarmPermission {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as AlarmPermission;
}

export async function requestPermission(): Promise<AlarmPermission> {
  if (!isNotificationSupported()) return 'unsupported';
  const result = await Notification.requestPermission();
  return result as AlarmPermission;
}

export async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch {
    return null;
  }
}

export async function scheduleAlarm(timeStr: string, enabled: boolean): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready;
  const [hour, minute] = timeStr.split(':').map(Number);
  reg.active?.postMessage({ type: 'SCHEDULE_ALARM', hour, minute, enabled });
}

export async function cancelAlarm(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  reg?.active?.postMessage({ type: 'CANCEL_ALARM' });
}

export function nextAlarmLabel(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h, m, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const diff = next.getTime() - now.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours === 0) return `${mins}분 후 알람`;
  return `${hours}시간 ${mins}분 후 알람`;
}
