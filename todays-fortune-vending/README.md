# 오늘의 재물운 자판기 (todays-fortune-vending)

토스 앱 안에서 동작하는 Apps in Toss 미니앱이에요. 캡슐 자판기에서 **하루에 한 번**
오늘의 재물운을 뽑아볼 수 있어요.

## 기능

- 🪙 **오늘의 재물운 뽑기** — 자판기 레버를 당기면 캡슐이 떨어지고 결과가 공개돼요.
- 📅 **하루 1회, 날짜 기반 재현성** — 같은 날에는 몇 번을 봐도 결과가 같아요.
  (`src/fortune.ts` 의 날짜 시드 기반 결정론적 난수)
- 📊 **재물운 점수 + 등급 + 한 줄 요약**, 행운의 아이템/색/숫자, 재테크 조언 제공.
- 🔥 **연속 방문 스트릭** — 매일 방문하면 연속 일수가 올라가요.
- 📴 브릿지 API(`Storage`, `generateHapticFeedback`)는 토스 앱 밖(브라우저)에서도
  깨지지 않도록 폴백 처리돼 있어요. (`src/sdk.ts`)

## 프로젝트 구조

```
src/
├─ App.tsx      # 자판기 UI (대기 → 배출 애니메이션 → 결과 카드)
├─ App.css      # 스타일 (골드 테마 자판기)
├─ fortune.ts   # 날짜 시드 기반 오늘의 재물운 생성 로직
├─ sdk.ts       # 앱인토스 브릿지 래퍼 (Storage / 햅틱, 브라우저 폴백)
└─ main.tsx     # 엔트리
granite.config.ts # 앱인토스 설정 (appName / brand / web)
```

## 시작하기

```bash
npm run dev     # 개발 서버 (granite dev)
```

## 배포하기

> ⚠️ 출시 전 `granite.config.ts` 의 `brand.icon` 을 실제 아이콘 이미지 주소로 채워주세요.

- 배포 API 키는 [앱인토스 콘솔](https://apps-in-toss.toss.im/) > 워크스페이스 > API 키에서 발급받아요.

```bash
npm run build   # ait build → todays-fortune-vending.ait 생성
npm run deploy  # ait deploy
```

빌드하면 콘솔에 업로드할 `.ait` 아티팩트가 만들어져요.

## 유용한 링크

- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
