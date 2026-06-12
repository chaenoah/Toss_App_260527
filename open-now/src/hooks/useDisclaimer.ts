import { useState, useEffect } from 'react';
import { Storage } from '@apps-in-toss/web-framework';

const STORAGE_KEY = 'disclaimer_v1_seen';

export function useDisclaimer() {
  // null = 스토리지 로딩 중, true = 표시 필요, false = 이미 확인
  const [needsDisclaimer, setNeedsDisclaimer] = useState<boolean | null>(null);

  useEffect(() => {
    Storage.getItem(STORAGE_KEY).then((val) => {
      setNeedsDisclaimer(val !== '1');
    });
  }, []);

  const accept = async () => {
    await Storage.setItem(STORAGE_KEY, '1');
    setNeedsDisclaimer(false);
  };

  return { needsDisclaimer, accept };
}
