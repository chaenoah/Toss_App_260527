// ── 완료 모달 위트 카피 (streak 구간별) ──────────────────────────────────────
export function getCompletionCopy(streak: number): { title: string; sub: string } {
  if (streak >= 365) return {
    title: '365일 완벽 개근 🏆',
    sub: '이쯤이면 사원이 아니라 회사 자체입니다. 전설 등극.',
  };
  if (streak >= 100) return {
    title: '100일 연속 무탈 출근 🎖️',
    sub: '100일 출근하면 대리 진급각 아닙니까? 인사팀에 청구서 보내세요.',
  };
  if (streak >= 30) return {
    title: '30일 연속 개근 🫡',
    sub: '30일 연속 무탈 출근, 이쯤이면 인사고과 +1 받아야 하는 거 아닙니까?',
  };
  if (streak >= 7) return {
    title: '7일 연속 출근 💪',
    sub: '일주일 개근 성공. 야근 면역 +5, 월급도둑 -1 달성.',
  };
  if (streak >= 5) return {
    title: `${streak}일째 완벽 출근 🌟`,
    sub: '5일 연속 무결점 출근. 이미 이달의 MVP 후보입니다.',
  };
  if (streak >= 3) return {
    title: `${streak}일째 무탈 출근 ✅`,
    sub: '오늘도 출근하셨군요. 오늘의 MVP 직장인으로 선정되셨습니다.',
  };
  if (streak === 2) return {
    title: '2일 연속 출근 🔥',
    sub: '어제도 오늘도. 직장인 기본기는 갖추셨군요.',
  };
  return {
    title: '오늘 모 직장인 완료 🫡',
    sub: '출근 준비 완벽 완료. 오늘 하루도 화이팅입니다 (억지로라도).',
  };
}

// ── 마일스톤 전용 카피 ────────────────────────────────────────────────────────
export function getMilestoneCopy(streak: number): { title: string; sub: string } {
  if (streak === 365) return {
    title: '🏆 1년 개근 전설 달성',
    sub: '직장인 계의 레전드. 이 기록은 후대에 전해질 것입니다.',
  };
  if (streak === 100) return {
    title: '🎖️ 100일 연속 출근',
    sub: '100일이면 대리 진급각. 인사팀 찾아가서 당당히 요구하세요.',
  };
  if (streak === 30) return {
    title: '🥇 30일 개근 달성',
    sub: '한 달 무결점. 이쯤이면 인사고과 A+ 당연한 거 아닙니까?',
  };
  if (streak === 7) return {
    title: '🔥 7일 연속 출근',
    sub: '일주일 완주! 야근 면역력 +10, 번아웃 저항력 +5 달성.',
  };
  return getCompletionCopy(streak);
}

// ── streak 공유 카드 카피 ─────────────────────────────────────────────────────
export function getShareCopy(streak: number): string {
  if (streak >= 100) return `${streak}일 연속 출근 중 🎖️\n이쯤이면 인사고과 A+ 아닌가요?`;
  if (streak >= 30)  return `${streak}일 연속 무탈 출근 🫡\n직장인 개근상 수상 자격 충분합니다.`;
  if (streak >= 7)   return `${streak}일 연속 출근 🔥\n일주일 개근, 야근 면역 +5 달성.`;
  return `오늘도 출근 준비 완료 ✅\n#출근OK 로 아침을 시작했습니다.`;
}

// ── 배너 카피 ─────────────────────────────────────────────────────────────────
export const UMBRELLA_TIP    = '오늘 비 소식 있어요 ☂️ 우산 챙기세요';
export const MASK_TIP_BAD     = '미세먼지 나쁨 😷 마스크 챙기세요';
export const MASK_TIP_VERY_BAD = '미세먼지 매우나쁨 🤢 오늘 마스크 없으면 진짜 위험해요';

// ── streak 라벨 ───────────────────────────────────────────────────────────────
export function getStreakLabel(streak: number): string {
  if (streak === 0)   return '첫 완료 시 streak 시작!';
  if (streak >= 100)  return `${streak}일 연속 🏆 전설의 영역`;
  if (streak >= 30)   return `${streak}일 연속 🎖️ 개근왕`;
  if (streak >= 7)    return `${streak}일 연속 🔥 불타는 출근`;
  return `${streak}일 연속 출근 🔥`;
}
