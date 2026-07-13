import { useState } from "react";
import { haptic } from "../sdk";

interface Props {
  streak: number;
  /** 리워드 광고 시청 + streak 복구를 수행하고 성공 여부를 반환해요. */
  onRecover: () => Promise<boolean>;
  onDismiss: () => void;
}

/** 연속 기록이 끊겼을 때, 광고를 보고 streak 를 살리는 복구권 모달. */
export function RecoveryModal({ streak, onRecover, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const recover = async () => {
    setLoading(true);
    setFailed(false);
    haptic("tap");
    const ok = await onRecover();
    setLoading(false);
    if (ok) {
      haptic("confetti");
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-emoji">💔🔥</div>
        <h2 className="modal-title">연속 기록이 끊길 뻔했어요!</h2>
        <p className="modal-body">
          어제 재물운을 놓쳐서 <b>{streak}일 연속</b> 기록이 사라질 위기예요.
          <br />
          광고를 보고 기록을 지켜볼까요?
        </p>

        {failed && (
          <p className="modal-error">지금은 광고를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.</p>
        )}

        <button className="btn btn-gold block" onClick={recover} disabled={loading}>
          {loading ? "복구하는 중…" : "🧧 광고 보고 기록 지키기"}
        </button>
        <button className="btn btn-ghost block" onClick={onDismiss} disabled={loading}>
          다음에 할게요
        </button>
      </div>
    </div>
  );
}
