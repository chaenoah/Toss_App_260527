// Service Worker: 출근 OK 알람
let alarmTimer = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_ALARM') {
    const { hour, minute, enabled } = e.data;
    clearAlarm();
    if (enabled) scheduleNext(hour, minute);
  }
  if (e.data?.type === 'CANCEL_ALARM') {
    clearAlarm();
  }
});

function clearAlarm() {
  if (alarmTimer !== null) {
    clearTimeout(alarmTimer);
    alarmTimer = null;
  }
}

function scheduleNext(hour, minute) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next.getTime() - now.getTime();
  alarmTimer = setTimeout(() => {
    fireAlarm();
    scheduleNext(hour, minute);
  }, delay);
}

async function fireAlarm() {
  const body = getAlarmBody();
  await self.registration.showNotification('출근 OK 🫡', {
    body,
    icon: '/appsintoss-logo.png',
    badge: '/appsintoss-logo.png',
    tag: 'chulgeun-alarm',
    renotify: true,
    requireInteraction: false,
    data: { url: '/' },
  });
}

function getAlarmBody() {
  const msgs = [
    '준비물 체크하고 칼퇴 향해 GO 🚀',
    '오늘도 무탈 출근 향해 출발! 준비물 먼저 확인해요 🫡',
    '지갑·핸드폰·사원증 — 이 셋만 챙겨도 절반은 성공이에요',
    '출근 준비 지금 시작! 나중에 지하철서 후회하지 말고요 🚇',
    '기상 완료, 이제 준비물 점검 차례입니다 📋',
  ];
  return msgs[new Date().getDay() % msgs.length];
}

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
