import { useRef, useState } from "react";
import { ResultCard } from "../components/ResultCard";
import { temperatureColors } from "../theme";
import type { ReadResult } from "../types";
import { saveCardImage } from "../utils/capture";

// 결과 화면: 결과 카드 + [이미지로 저장] + [다시 판독하기].
// 온도에 따라 화면 배경색이 코랄↔블루그레이로 변한다.

interface Props {
  result: ReadResult;
  onRestart: () => void;
}

export function ResultScreen({ result, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const colors = temperatureColors(result.temperature);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleSave = async () => {
    if (!cardRef.current || saving) return;
    setSaving(true);
    try {
      const how = await saveCardImage(cardRef.current);
      if (how === "shared") showToast("공유 창을 열었어요");
      else if (how === "downloaded") showToast("이미지를 저장했어요");
      else showToast("스크린샷으로 저장해 공유해 주세요");
    } catch {
      showToast("저장에 실패했어요. 스크린샷으로 저장해 주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="screen result"
      style={{ background: colors.bg }}
    >
      <div className="result__scroll">
        {/* 캡처 대상 카드 */}
        <ResultCard ref={cardRef} result={result} />
      </div>

      {/* 하단 액션 */}
      <div className="result__actions">
        <button
          type="button"
          className="primary-btn"
          style={{ background: colors.accent }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "이미지 만드는 중…" : "이미지로 저장"}
        </button>
        <button type="button" className="ghost-btn" onClick={onRestart}>
          다시 판독하기
        </button>
      </div>

      {/* 간단 토스트 */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
