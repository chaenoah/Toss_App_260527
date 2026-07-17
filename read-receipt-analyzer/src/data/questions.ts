import type { Question } from "../types";

// 7개의 판독 질문.
// - score: 각 선택지의 "진심도"(0.0~1.0). 긍정 답변일수록 높음.
// - weight: 질문별 가중치. 기획 요구대로 "답장 속도"와 "읽씹/안읽씹 빈도"를 크게.
//   (가중치 총합은 아래 로직에서 정규화에 사용됨)
export const QUESTIONS: Question[] = [
  {
    id: "replySpeed",
    emoji: "⏱️",
    title: "평균 답장 속도는 어때요?",
    weight: 2.0, // 크게
    options: [
      { label: "5분 내로 온다", score: 1.0 },
      { label: "1시간 안에는 온다", score: 0.7 },
      { label: "반나절쯤 걸린다", score: 0.35 },
      { label: "하루는 기본이다", score: 0.0 },
    ],
  },
  {
    id: "readIgnore",
    emoji: "👀",
    title: "읽고 답 안 하는 '읽씹', 얼마나 자주?",
    weight: 2.0, // 크게
    options: [
      { label: "거의 없다", score: 1.0 },
      { label: "가끔 있다", score: 0.5 },
      { label: "자주 있다", score: 0.0 },
    ],
  },
  {
    id: "whoContacts",
    emoji: "📞",
    title: "먼저 연락하는 쪽은 누구예요?",
    weight: 1.0,
    options: [
      { label: "거의 나", score: 0.15 },
      { label: "거의 상대", score: 1.0 },
      { label: "반반이다", score: 0.6 },
    ],
  },
  {
    id: "replyLength",
    emoji: "✍️",
    title: "상대 답장 길이는 보통 어때요?",
    weight: 1.0,
    options: [
      { label: "단답 (ㅇㅇ, ㅋㅋ)", score: 0.2 },
      { label: "나랑 비슷", score: 0.6 },
      { label: "나보다 길다", score: 1.0 },
    ],
  },
  {
    id: "emojiUsage",
    emoji: "😆",
    title: "이모티콘·ㅋㅋ 사용은요?",
    weight: 1.0,
    options: [
      { label: "거의 없다", score: 0.2 },
      { label: "가끔 쓴다", score: 0.6 },
      { label: "많이 쓴다", score: 1.0 },
    ],
  },
  {
    id: "asksBack",
    emoji: "❓",
    title: "내 얘기에 되물어봐 주나요?",
    weight: 1.5,
    options: [
      { label: "안 되물어본다", score: 0.0 },
      { label: "가끔 되물어본다", score: 0.5 },
      { label: "자주 되물어본다", score: 1.0 },
    ],
  },
  {
    id: "unreadIgnore",
    emoji: "🧊",
    title: "읽지도 않는 '안읽씹', 얼마나?",
    weight: 2.0, // 크게
    options: [
      { label: "거의 없다", score: 1.0 },
      { label: "가끔 있다", score: 0.4 },
      { label: "자주 있다", score: 0.0 },
    ],
  },
];
