import { useState, useCallback } from 'react';
import {
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  scheduleAlarm,
  cancelAlarm,
  type AlarmPermission,
} from '../lib/alarm';
import {
  loadAlarmEnabled,
  saveAlarmEnabled,
  loadAlarmTime,
  saveAlarmTime,
} from '../lib/storage';

export function useAlarm() {
  const [enabled, setEnabled] = useState(() => loadAlarmEnabled());
  const [alarmTime, setAlarmTimeState] = useState(() => loadAlarmTime());
  const [permission, setPermission] = useState<AlarmPermission>(() => getPermissionStatus());
  const [requesting, setRequesting] = useState(false);

  const toggle = useCallback(async () => {
    if (!isNotificationSupported()) {
      alert('이 환경에서는 알림이 지원되지 않아요 😢');
      return;
    }

    if (!enabled) {
      if (permission !== 'granted') {
        setRequesting(true);
        const result = await requestPermission();
        setPermission(result);
        setRequesting(false);
        if (result !== 'granted') {
          alert('알림 권한이 거부됐어요. 기기 설정에서 허용해 주세요.');
          return;
        }
      }
      saveAlarmEnabled(true);
      setEnabled(true);
      await scheduleAlarm(alarmTime, true);
    } else {
      saveAlarmEnabled(false);
      setEnabled(false);
      await cancelAlarm();
    }
  }, [enabled, permission, alarmTime]);

  const updateTime = useCallback(async (t: string) => {
    saveAlarmTime(t);
    setAlarmTimeState(t);
    if (enabled) await scheduleAlarm(t, true);
  }, [enabled]);

  return { enabled, alarmTime, permission, requesting, toggle, updateTime };
}
