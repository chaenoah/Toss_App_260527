import { useState } from "react";
import { dateKey } from "../utils/date";
import { haptic } from "../sdk";

interface Props {
  onComplete: (birth: string) => void;
}

/** 최초 1회 생년월일(양력) 입력 화면 */
export function OnboardingScreen({ onComplete }: Props) {
  const today = dateKey();
  const [birth, setBirth] = useState("");

  const valid = birth !== "" && birth <= today;

  const submit = () => {
    if (!valid) return;
    haptic("success");
    onComplete(birth);
  };

  return (
    <div className="screen center">
      <div className="onboarding">
        <div className="onboarding-emoji">🔮</div>
        <h1 className="title">오늘의 재물운 자판기</h1>
        <p className="subtitle">
          생년월일을 넣으면 사주 오행으로
          <br />
          매일의 재물운을 뽑아드려요.
        </p>

        <label className="field">
          <span className="field-label">생년월일 (양력)</span>
          <input
            className="field-input"
            type="date"
            max={today}
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </label>

        <button className="btn btn-primary block" onClick={submit} disabled={!valid}>
          재물운 자판기 시작하기
        </button>
        <p className="onboarding-note">
          생년월일은 이 기기에만 저장돼요. 서버로 전송하지 않아요.
        </p>
      </div>
    </div>
  );
}
