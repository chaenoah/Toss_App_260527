# 직장인 생존 필터 (office-survival-filter)

Apps in Toss 미니앱. WebView (Vite + React 18) + TDS Mobile.

## Stack
- `@apps-in-toss/web-framework` (Granite)
- `@toss/tds-mobile`, `@toss/tds-mobile-ait`, `@toss/tds-colors`
- React 18, Vite 6, TypeScript

## Commands
- `npm run dev` — granite dev 서버 (localhost:5173)
- `npm run build` — `ait build`
- `npm run deploy` — `ait deploy`
- `npm run lint` / `npm run format`

## Apps in Toss MCP
이 프로젝트는 공식 `apps-in-toss` MCP 서버에 연결되어 있어요. AI 어시스턴트가 사용할 수 있는 도구:
- `search_docs` / `get_doc` — AppsInToss 문서 (한국어로 검색)
- `search_tds_web_docs` / `get_tds_web_doc` — TDS Mobile (WebView용) 문서
- `list_examples` / `get_example` — 공식 예제 코드

**검색 규칙**: 모든 문서는 한국어. 검색 키워드도 한국어로 (예: "결제 연동", "스크롤 뷰"). 단 컴포넌트명/API명(Button, Toast, AdMob 등)은 원문 유지.

## Project Rules
- `granite.config.ts` 의 `appName` 은 RFC-1123 (`^(?!-)[a-z0-9-]{1,63}(?<!-)$`)
- `brand.displayName` 은 반드시 한글
- `brand.icon` 설정 필요 (현재 비어 있음 — 출시 전 보강)
- 비게임 미니앱이므로 **TDS 사용 필수** — `@toss/tds-mobile` 컴포넌트로 UI 구성
- 빌드 커맨드는 `ait build`

## References
- 콘솔: https://apps-in-toss.toss.im/
- 개발자센터: https://developers-apps-in-toss.toss.im/
- 공식 예제: https://github.com/toss/apps-in-toss-examples
