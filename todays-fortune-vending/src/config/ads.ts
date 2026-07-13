// 광고 설정.
//
// 실제 광고를 노출하려면 앱인토스 콘솔에서 광고 그룹(리워드/전면)을 만들고,
// 발급받은 광고 그룹 ID를 아래에 채운 뒤 `enabled`를 true 로 바꾸세요.
// 값이 비어 있으면 광고 훅은 안전하게 no-op 으로 동작해요(브라우저/미설정 환경).

export const ADS = {
  enabled: false,
  // TODO(콘솔): 전면(인터스티셜) 광고 그룹 ID
  interstitialAdGroupId: "",
  // TODO(콘솔): 리워드 광고 그룹 ID
  rewardedAdGroupId: "",
  // 전면 광고 노출 빈도 제한 — 하루 최대 노출 횟수 (앱 리뷰 정책 대응)
  interstitialDailyCap: 3,
} as const;
