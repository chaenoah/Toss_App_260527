// 공유·딥링크 등 앱 전역 상수.
// appName은 앱인토스 콘솔 등록값(ghostcheck)과 동일해야 딥링크가 연결된다.

export const APP_NAME = "답장 판독기";

// 이 미니앱으로 진입하는 딥링크. getTossShareLink에 넘겨 공유 링크로 변환한다.
// 형식: intoss://<appName>[/path]
export const DEEP_LINK = "intoss://ghostcheck";

// 공유 링크가 SNS·메신저에서 보일 때의 OG 미리보기 이미지(호스팅된 URL).
// 결과별 이미지는 호스팅이 필요해 불가하므로, 우선 앱 로고를 브랜디드 프리뷰로 사용.
export const OG_IMAGE_URL =
  "https://static.toss.im/appsintoss/43957/f903cf6b-8dd3-4aab-a93f-c6cb124bec17.png";

// ---------- 프로모션(리워드) ----------
export interface Promotion {
  code: string; // 앱인토스 콘솔에서 발급한 프로모션 코드
  label: string; // 버튼에 노출될 문구
  // 지급 포인트. ⚠️ 콘솔 프로모션에 설정한 '1회 지급 금액'과 맞춰야 함
  // (초과 시 grantPromotionReward가 4114 에러 반환). 값 미정이라 우선 100으로 둠.
  amount: number;
}

// 결과 화면에 노출할 프로모션 목록. 각 프로모션은 '1일 1회'만 참여 가능(아래 로직에서 제한).
export const PROMOTIONS: Promotion[] = [
  {
    label: "읽씹 이유 확인하기",
    code: "TEST_01KXS8ZM8JBK4PA4KYV1P7AWCE",
    amount: 100,
  },
  {
    label: "읽씹 판독 같이 해보기",
    code: "TEST_01KXS92YG69YR1BXX9HR0S7N5B",
    amount: 100,
  },
];
