import { useCallback, useRef, useState } from 'react';
import { claimPromotion, isPromoClaimedToday, type PromoName } from '../lib/promotion';

export type PromoStatus = 'idle' | 'claiming' | 'granted' | 'already' | 'failed';

/** 프로모션 지급 상태를 UI에 노출하는 훅 (체크리스트 완료 트리거용) */
export function usePromotion(name: PromoName) {
  const [status, setStatus] = useState<PromoStatus>('idle');
  const claimingRef = useRef(false);

  const claim = useCallback(async () => {
    if (claimingRef.current) return;
    if (isPromoClaimedToday(name)) {
      setStatus('already');
      return;
    }
    claimingRef.current = true;
    setStatus('claiming');
    const r = await claimPromotion(name);
    setStatus(r); // 'granted' | 'already' | 'failed'
    claimingRef.current = false;
  }, [name]);

  return { status, claim };
}
