import { trackEvent } from './adTracking';

/**
 * 공유 리워드.
 *
 * ⚠️ 현재 설치된 @apps-in-toss/web-bridge(웹 SDK)에는 "공유 리워드" 전용 API가
 *    노출되어 있지 않습니다. (grantPromotionReward 등은 React Native 네이티브
 *    모듈 번들에만 존재하며 웹 앱에서 import할 수 없습니다.)
 *    공식 문서(developers-apps-in-toss.toss.im)는 조직 egress 정책상 접근이
 *    차단되어 정확한 웹용 공유 리워드 API 시그니처를 확인할 수 없었습니다.
 *
 * 따라서 지금은 네이티브 공유(Web Share API) + 트래킹으로 구현하고,
 * 실제 공유 리워드 SDK가 웹에 제공되면 아래 표시된 지점만 교체하면 되도록
 * 어댑터로 분리해 두었습니다.
 *
 * === 콘솔에서 확인/설정해야 할 항목 ===
 *  1. 공유 리워드(초대/프로모션 리워드) 기능 활성화 (비게임 앱 지원 여부 확인)
 *  2. 공유 리워드 캠페인 생성 및 리워드 조건/한도 설정
 *  3. 공유 링크(딥링크/유입 파라미터) 발급
 *  4. 리워드 지급 검증 방식(서버 웹훅 or 클라이언트 SDK) 확인
 *  5. 웹(WebView) 앱에서 호출 가능한 공유 리워드 API 제공 여부 확인
 */
export async function shareWithReward(text: string): Promise<void> {
  const canWebShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  trackEvent('share_reward_sent', { method: canWebShare ? 'web_share' : 'clipboard' });

  // TODO(공유 리워드 SDK): 웹용 공유 리워드 API가 확인되면 이 블록을 해당 호출로 교체.
  //   예) 공유 링크 생성 → 공유 시트 노출 → 유입/리워드 지급 이벤트 트래킹
  try {
    if (canWebShare) {
      await navigator.share({ title: '출근 OK', text });
      trackEvent('share_reward_completed', { method: 'web_share' });
    } else {
      await navigator.clipboard.writeText(text);
      alert('클립보드에 복사됐어요 📋 친구에게 공유해보세요!');
      trackEvent('share_reward_completed', { method: 'clipboard' });
    }
  } catch {
    // 사용자가 공유 시트를 취소한 경우 등 — 조용히 무시
    trackEvent('share_reward_cancelled');
  }
}
