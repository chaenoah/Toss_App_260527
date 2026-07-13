# 오늘의 재물운 자판기 (todays-fortune-vending)

토스 앱 안에서 동작하는 Apps in Toss 미니앱이에요. 생년월일을 넣으면 **사주 오행**으로
매일의 재물운을 뽑아주고, **소비 처방**과 **1:1 공유 카드**를 만들어줘요.

## 플로우 (Phase 1)

```
온보딩(생년월일) → 홈(streak) → 슬롯머신 애니메이션 → 결과(점수·코멘트·소비처방·공유카드)
```

## 기능

- 🔮 **사주 오행 기반 재물운**: 생년월일의 일간(오행)과 오늘의 기운을 상생·상극(십신)으로
  판정해 0~100점 + 등급 + 코멘트를 생성해요. (`src/logic/fortuneEngine.ts`)
- 📅 **하루 1회, 재현성**: (생년월일 + 날짜) 시드 → 같은 날은 같은 결과, 매일 갱신.
- 💊 **소비 처방**: "질러도 되는 날 / 지출 참는 날" 등 점수대별 행동 가이드.
- 🖼 **1:1 결과 카드**: canvas로 정사각형 이미지를 만들어 공유/저장. (`src/components/ShareCard.tsx`)
- 🔥 **연속 방문 streak** + 이정표 뱃지(3/7/30/100일) + **달성 연출**. (`src/logic/streakManager.ts`)
- 🛟 **streak 복구권**(Phase 2): 기록이 끊기면 리워드 광고를 보고 살릴 수 있어요. (`src/components/RecoveryModal.tsx`)
- 🧧 **복주머니(리워드 광고)**: 광고 시청 시 상세 리포트 해제. (`src/hooks/useRewardAd.ts`)
- 📊 **이벤트 트래킹**: `result_generated` 등 커스텀 이벤트를 eventLog로 기록.
- 📴 브릿지 API(Storage/햅틱/공유/광고)는 토스 앱 밖(브라우저)에서도 깨지지 않게 폴백 처리.

> 디자인: 다크 + 골드/네온, **모서리는 직각(사각)** 통일.

## 파일 구조

```
src/
├─ App.tsx                     # 화면 상태 머신(오케스트레이터)
├─ App.css
├─ screens/
│  ├─ OnboardingScreen.tsx     # 생년월일 입력(최초 1회)
│  ├─ HomeScreen.tsx           # 뽑기 진입 + streak
│  ├─ SlotMachineScreen.tsx    # 뽑기 애니메이션
│  └─ ResultScreen.tsx         # 결과 + 공유 + 복주머니
├─ components/
│  ├─ ShareCard.tsx            # 1:1 canvas 결과 카드
│  └─ StreakBadge.tsx
├─ logic/
│  ├─ fortuneEngine.ts         # 사주 오행 재물운 엔진
│  └─ streakManager.ts         # streak 관리(+복구권 준비)
├─ hooks/
│  ├─ useRewardAd.ts           # 리워드 광고(복주머니/streak 복구)
│  └─ useInterstitialAd.ts     # 전면 광고(빈도 제한)
├─ utils/  (date, rng, eventTracking)
├─ config/ads.ts               # 광고 그룹 ID / enabled 플래그
└─ sdk.ts                      # 앱인토스 브릿지 래퍼(브라우저 폴백)
```

## 다음 단계 (Phase 3+)

- ✅ (Phase 2) streak 복구권 모달 + 뱃지 달성 연출 — 완료
- 주말 전용 "이번 주 재물운 총평" 화면
- 공유 리워드(복주머니 지급)
- (선택) 돈 궁합 · 시장 정보

## 개발 / 배포

```bash
npm run dev     # 개발 서버 (granite dev)
npm run build   # ait build → todays-fortune-vending.ait 생성
npm run deploy  # ait deploy (콘솔 API 키 필요)
```

> ⚠️ 출시 전: `granite.config.ts` 의 `brand.icon` 설정, `src/config/ads.ts` 에 광고 그룹 ID 입력.
> 광고·인앱결제는 샌드박스에서 테스트 불가 → 실기기 + 실제 토스앱 필요.

## 링크

- [앱인토스 콘솔](https://apps-in-toss.toss.im/) · [개발자센터](https://developers-apps-in-toss.toss.im/) · [개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
