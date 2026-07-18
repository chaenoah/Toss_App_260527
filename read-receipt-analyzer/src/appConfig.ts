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
