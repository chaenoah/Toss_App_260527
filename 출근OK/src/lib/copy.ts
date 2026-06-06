// 완료 카드 위트 카피 (streak 구간별)
export function getCompletionCopy(streak: number): { title: string; sub: string } {
  if (streak >= 365) {
    return {
      title: '365일 완벽 출근 🏆',
      sub: '이쯤이면 사원이 아니라 회사 자체입니다. 전설의 시작.',
    };
  }
  if (streak >= 100) {
    return {
      title: '100일 연속 무탈 출근 🎖️',
      sub: '100일 출근하면 대리 진급각 아닙니까? 인사팀에 청구서 보내세요.',
    };
  }
  if (streak >= 30) {
    return {
      title: '30일 연속 개근 🫡',
      sub: '30일 연속 무탈 출근, 이쯤이면 인사고과 +1 받아야 하는 거 아닙니까?',
    };
  }
  if (streak >= 7) {
    return {
      title: '7일 연속 출근 💪',
      sub: '일주일 개근 성공. 야근 면역 +5, 월급도둑 -1 달성.',
    };
  }
  if (streak >= 3) {
    return {
      title: `${streak}일째 무탈 출근 ✅`,
      sub: '오늘도 출근하셨군요. 오늘의 MVP 직장인으로 선정되셨습니다.',
    };
  }
  return {
    title: '오늘 모 직장인 완료 🫡',
    sub: '출근 준비 완벽 완료. 오늘 하루도 화이팅입니다 (억지로라도).',
  };
}

// 체크리스트 완료 직전 항목이 하나 남았을 때
export const ALMOST_DONE_COPY = [
  '거의 다 왔어요, 출근계의 차세대 주자 👀',
  '마지막 하나, 놓치면 지하철 안에서 후회합니다',
  '막판 스퍼트! 여기서 포기하면 안 됩니다',
];

// 우산 자동 추가 배너
export const UMBRELLA_TIP = '오늘 비 소식 있어요 ☂️ 우산 챙기세요';

// 빈 streak 상태
export const STREAK_ZERO_COPY = '첫 완료 시 streak 시작!';

export function getStreakLabel(streak: number): string {
  if (streak === 0) return STREAK_ZERO_COPY;
  return `${streak}일 연속 출근 🔥`;
}
