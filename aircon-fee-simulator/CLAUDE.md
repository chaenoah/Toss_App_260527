# 에어컨 요금 시뮬레이터 (aircon-fee-simulator)

앱인토스(Apps in Toss) **WebView 미니앱**. Vite + React 19 + TypeScript, `@apps-in-toss/web-framework` 기반.

## 프로젝트 규칙

- **패키지 매니저**: npm
- **설정 파일**: `granite.config.ts`
  - `appName`: 콘솔에 등록하는 영문 식별자 (`aircon-fee-simulator`)
  - `brand.displayName`: 화면에 노출되는 한글 이름 (`에어컨 요금 시뮬레이터`)
  - `brand.icon`: 배포 전 **반드시 채울 것** (비어 있으면 QR/실기기 테스트에서 오류가 잦음)
  - `permissions`: 사용하는 디바이스 권한을 명시 (기본 `[]`)
- **엔트리**: `src/main.tsx` → `src/App.tsx`
- **스크립트**: `npm run dev`(granite dev) · `npm run build`(ait build) · `npm run deploy`(ait deploy) · `npm run lint` · `npm run format`

## 출시 전 교체 체크리스트 (`src/App.tsx` 상단 상수)

- `REWARDED_AD_GROUP_ID` — 콘솔에서 발급한 **리워드형 광고 그룹 ID**로 교체. **테스트 중엔 반드시 테스트용 ID** 사용(운영 ID로 테스트 시 제재).
- `NORMAL_TIERS`/`SUMMER_TIERS`, `CLIMATE_CHARGE`, `FUEL_CHARGE`, `FUND_RATE` — 출시 시점 **한전 공식 요금표**로 재확인(요율은 개정됨).
- `AC_PRESETS`/`PYEONG_FACTOR` — 대표 추정치. 실제 제품 스펙으로 보정 권장.
- `AVG_KWH` — 평균 대비 비교용 참고 벤치마크(추정치).
- `granite.config.ts`의 `brand.icon` — 배포 전 반드시 채우기.

## 앱인토스 필수 준수 사항

- **iframe 사용 금지** — SDK 오동작 + 심사 반려 사유.
- 라이브 환경은 **HTTPS만** 허용(샌드박스는 HTTP 허용).
- 광고 연동 시 **테스트 전용 광고 ID**만 사용(운영 ID 사용 시 제재).
- 서버 API(로그인/결제 검증 등) 호출은 **mTLS** 선행 필요.
- 앱 정보는 코딩 전에 **콘솔에 먼저 등록**, 오픈 정책 준수(위반 시 승인 거부/중단).

## SDK 사용

- 웹뷰 SDK는 `@apps-in-toss/web-framework`에서 import.
- 디바이스/플랫폼 기능(로그인 `appLogin`, IAP, 광고, 위치, 카메라, 앨범, 연락처, 햅틱, 클립보드, 공유, 스토리지, 네트워크상태 등)은 공식 예제(`toss/apps-in-toss-examples`)의 `with-*` 디렉터리 패턴을 참고.
- 정확한 API 시그니처가 필요하면 공식 `ax` MCP(`search_docs`/`get_doc`) 또는 개발자센터 문서를 확인(환각 방지).

## 참고 링크

- 개발자센터: https://developers-apps-in-toss.toss.im
- 콘솔: https://apps-in-toss.toss.im
- 공식 예제: https://github.com/toss/apps-in-toss-examples
- 공식 MCP(ax): https://github.com/toss/apps-in-toss-ax

> 참고: 이 프로젝트는 비대화형/문서도메인 차단 환경에서 생성되어 `create-ait-app`의 자동 skills 다운로드를 건너뛰었습니다. 위 내용은 그 대체 요약입니다.
