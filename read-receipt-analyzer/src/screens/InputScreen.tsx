import { useState } from "react";
import { OptionButton } from "../components/OptionButton";
import { QUESTIONS } from "../data/questions";
import type { Answers, QuestionId } from "../types";

// 입력 화면: 질문 7개를 한 화면에 하나씩. 탭으로 선택하면 잠깐 뒤 자동으로 다음 질문.

interface Props {
  answers: Answers;
  onPick: (id: QuestionId, optionIndex: number) => void;
  onComplete: () => void; // 마지막 질문까지 답했을 때
  onExit: () => void; // 첫 질문에서 뒤로 → 인트로로
}

export function InputScreen({ answers, onPick, onComplete, onExit }: Props) {
  const [index, setIndex] = useState(0);
  const total = QUESTIONS.length;
  const q = QUESTIONS[index];
  const selected = answers[q.id];

  // 선택 시: 답 저장 → 살짝 딜레이 후 다음(또는 완료). 딜레이는 선택 피드백을 보여주기 위함.
  const handlePick = (optionIndex: number) => {
    onPick(q.id, optionIndex);
    window.setTimeout(() => {
      if (index === total - 1) {
        onComplete();
      } else {
        setIndex((i) => i + 1);
      }
    }, 240);
  };

  const handleBack = () => {
    if (index === 0) {
      onExit();
    } else {
      setIndex((i) => i - 1);
    }
  };

  return (
    <div className="screen input">
      {/* 상단 진행바 + 뒤로 */}
      <div className="input__top">
        <button
          type="button"
          className="icon-btn"
          onClick={handleBack}
          aria-label="이전"
        >
          ←
        </button>
        <div className="progress">
          <div
            className="progress__fill"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="input__count">
          {index + 1}/{total}
        </span>
      </div>

      {/* 질문 */}
      <div className="input__q">
        <div className="input__q-emoji" aria-hidden>
          {q.emoji}
        </div>
        <h2 className="input__q-title">{q.title}</h2>
      </div>

      {/* 선택지 */}
      <div className="input__options">
        {q.options.map((opt, i) => (
          <OptionButton
            key={opt.label}
            label={opt.label}
            selected={selected === i}
            onClick={() => handlePick(i)}
          />
        ))}
      </div>
    </div>
  );
}
