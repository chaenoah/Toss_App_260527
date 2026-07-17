import { COMMENTS, GRADES } from "./data/comments";
import { QUESTIONS } from "./data/questions";
import type { Answers, Grade, ReadResult } from "./types";

// 답변으로부터 관계 온도(0~100)를 계산.
// 방식: 각 질문의 (선택 점수 × 가중치)를 모두 더하고, 가중치 총합으로 나눠 정규화 → 100 스케일.
// 답장 속도·읽씹·안읽씹의 weight가 커서 온도에 크게 반영된다.
export function calcTemperature(answers: Answers): number {
  let weighted = 0; // Σ(score × weight)
  let totalWeight = 0; // Σ(weight)

  for (const q of QUESTIONS) {
    const picked = answers[q.id];
    if (picked == null) continue; // 아직 안 고른 질문은 제외
    const option = q.options[picked];
    if (!option) continue;
    weighted += option.score * q.weight;
    totalWeight += q.weight;
  }

  if (totalWeight === 0) return 0;
  const temp = (weighted / totalWeight) * 100;
  return Math.round(temp);
}

// 온도에 해당하는 등급을 반환 (min 내림차순으로 정렬되어 있어 먼저 만족하는 등급 채택).
export function getGrade(temp: number): Grade {
  return GRADES.find((g) => temp >= g.min) ?? GRADES[GRADES.length - 1];
}

// 등급별 저격 멘트 중 하나를 랜덤으로 선택.
export function pickComment(gradeKey: Grade["key"]): string {
  const list = COMMENTS[gradeKey];
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

// 답변 → 최종 판독 결과(온도·등급·멘트) 한 번에 계산.
export function analyze(answers: Answers): ReadResult {
  const temperature = calcTemperature(answers);
  const grade = getGrade(temperature);
  const comment = pickComment(grade.key);
  return { temperature, grade, comment };
}

// 모든 질문에 답했는지 확인 (입력 완료 판정용).
export function isAllAnswered(answers: Answers): boolean {
  return QUESTIONS.every((q) => answers[q.id] != null);
}
