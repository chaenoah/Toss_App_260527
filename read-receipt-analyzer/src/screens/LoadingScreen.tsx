import { useEffect, useState } from "react";

// 로딩 연출 화면: 2초간 "답장 패턴 분석 중..."을 보여줘 기대감을 준 뒤 결과로 전환.

interface Props {
  onDone: () => void;
}

// 순차적으로 지나가는 분석 문구 (연출용)
const STEPS = [
  "답장 속도 계산 중…",
  "읽씹 빈도 분석 중…",
  "진심 지수 추출 중…",
];

export function LoadingScreen({ onDone }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 문구를 약 0.6초 간격으로 바꿔줌
    const stepTimer = window.setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 600);
    // 총 2초 뒤 결과 공개
    const doneTimer = window.setTimeout(onDone, 2000);
    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div className="screen loading">
      <div className="loading__spinner" aria-hidden />
      <p className="loading__title">답장 패턴 분석 중...</p>
      <p className="loading__step">{STEPS[step]}</p>
    </div>
  );
}
