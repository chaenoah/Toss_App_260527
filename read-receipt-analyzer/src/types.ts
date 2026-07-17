// 앱 전반에서 사용하는 타입 정의 모음

// 화면 단계: 인트로 → 입력 → 로딩(분석 연출) → 결과
export type Step = "intro" | "input" | "loading" | "result";

// 질문 식별자 (7개)
export type QuestionId =
  | "replySpeed" // 평균 답장 속도
  | "readIgnore" // 읽씹(읽고 답 안 함) 빈도
  | "whoContacts" // 먼저 연락하는 쪽
  | "replyLength" // 답장 길이
  | "emojiUsage" // 이모티콘·ㅋㅋ 사용
  | "asksBack" // 질문을 되물어보는지
  | "unreadIgnore"; // 안 읽씹(읽지도 않음) 빈도

// 선택지 하나
export interface Option {
  label: string; // 버튼에 노출될 문구
  // 0.0 ~ 1.0 사이의 "진심도" 점수. 높을수록 긍정(진심에 가까움).
  score: number;
}

// 질문 하나
export interface Question {
  id: QuestionId;
  title: string; // 질문 본문
  emoji: string; // 질문 상단 이모지 (분위기용)
  weight: number; // 온도 계산 시 가중치. 답장 속도·읽씹 관련은 크게.
  options: Option[];
}

// 사용자가 고른 답변 모음 (질문 id → 선택한 옵션 인덱스)
export type Answers = Partial<Record<QuestionId, number>>;

// 등급 키 (5단계)
export type GradeKey = "fire" | "warm" | "lukewarm" | "cooling" | "ice";

// 등급 정의
export interface Grade {
  key: GradeKey;
  label: string; // 예: "불꽃 진심"
  min: number; // 이 등급의 최소 온도(이상)
}

// 최종 판독 결과
export interface ReadResult {
  temperature: number; // 0 ~ 100
  grade: Grade;
  comment: string; // 등급별 저격 멘트 (랜덤 1개)
}
