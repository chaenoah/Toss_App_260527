import { useCallback, useState } from "react";
import "./App.css";
import { analyze } from "./logic";
import { IntroScreen } from "./screens/IntroScreen";
import { InputScreen } from "./screens/InputScreen";
import { LoadingScreen } from "./screens/LoadingScreen";
import { ResultScreen } from "./screens/ResultScreen";
import type { Answers, QuestionId, ReadResult, Step } from "./types";

// 앱 루트: 단계(step) 상태 머신으로 4개 화면을 전환한다.
// intro → input → loading → result → (다시) intro
function App() {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ReadResult | null>(null);

  // 질문 하나에 답 저장
  const handlePick = useCallback((id: QuestionId, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [id]: optionIndex }));
  }, []);

  // 입력 완료 → 로딩 연출로
  const handleComplete = useCallback(() => {
    setStep("loading");
  }, []);

  // 로딩 끝 → 결과 계산(한 번) 후 결과 화면. 멘트 랜덤은 여기서 고정된다.
  const handleLoaded = useCallback(() => {
    setResult(analyze(answers));
    setStep("result");
  }, [answers]);

  // 처음부터 다시 (다른 사람 재측정)
  const handleRestart = useCallback(() => {
    setAnswers({});
    setResult(null);
    setStep("intro");
  }, []);

  return (
    <div className="app">
      {step === "intro" && (
        <IntroScreen onStart={() => setStep("input")} />
      )}

      {step === "input" && (
        <InputScreen
          answers={answers}
          onPick={handlePick}
          onComplete={handleComplete}
          onExit={() => setStep("intro")}
        />
      )}

      {step === "loading" && <LoadingScreen onDone={handleLoaded} />}

      {step === "result" && result && (
        <ResultScreen result={result} onRestart={handleRestart} />
      )}
    </div>
  );
}

export default App;
