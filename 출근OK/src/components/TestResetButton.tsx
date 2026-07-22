import { IS_PROMO_TEST } from '../lib/promotion';

// 테스트 재시도를 막는 "하루 1회" 관련 플래그 + 체크리스트 상태
const RESET_KEYS = [
  'modal_shown_date', // 완료 모달 1일 1회 제한
  'promo_checkin_claimed', // 출근체크 프로모션 지급 이력
  'promo_outfit_claimed', // 옷차림 프로모션 지급 이력
  'outfit_unlocked_date', // 옷차림 잠금해제 이력
  'chulgeun_ok_app', // 체크리스트 체크 상태 (초기화해 다시 체크 가능)
];

/**
 * 테스트 전용 초기화 버튼 (IS_PROMO_TEST=true 일 때만 노출).
 * 하루 1회 제한 플래그와 지급 이력을 지우고 새로고침 → 프로모션 재테스트 가능.
 * 라이브 전환(IS_PROMO_TEST=false) 시 자동으로 사라짐.
 */
export function TestResetButton() {
  if (!IS_PROMO_TEST) return null;

  const handleReset = () => {
    RESET_KEYS.forEach((k) => localStorage.removeItem(k));
    location.reload();
  };

  return (
    <button className="test-reset-btn" onClick={handleReset}>
      🧪 테스트 초기화
    </button>
  );
}
