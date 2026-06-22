import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  // ── 앱 식별자 (영문 소문자, 토스 개발자 콘솔에 등록된 appName과 일치해야 함) ──
  appName: "moodspense",

  // ── 브랜드 (미니앱 헤더 · 스플래시에 표시) ──
  brand: {
    displayName: "감정자판기",
    primaryColor: "#F5C518",   // 로고의 노란색 배경 추출
    icon: "https://static.toss.im/appsintoss/43957/43a6aad4-479c-4c08-85d4-99c85f189a39.png",
  },

  // ── 로컬 개발 서버 ──
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },

  // ── 권한 (MVP: 없음 / 추후 알림 권한 추가 예정) ──
  permissions: [],

  // ── 빌드 결과물 경로 ──
  outdir: "dist",
});

/*
 * ──────────────────────────────────────────────────────────────
 *  토스 개발자 콘솔(developers-apps-in-toss.toss.im)에서
 *  아래 스토어 메타데이터를 별도로 입력해야 합니다.
 * ──────────────────────────────────────────────────────────────
 *
 *  앱 이름       감정자판기
 *  appName       moodspense
 *  부제          오늘 기분에 딱 맞는 처방전
 *  카테고리      생활 > 건강 > 심리
 *                생활 > 일상 > 기타
 *  검색 키워드   감정일기, 오늘의운세, 심리테스트, 타로, 스트레스
 *  앱 로고       https://static.toss.im/appsintoss/43957/43a6aad4-479c-4c08-85d4-99c85f189a39.png
 *  고객문의 이메일  busy0317@gmail.com
 *
 * ──────────────────────────────────────────────────────────────
 */
