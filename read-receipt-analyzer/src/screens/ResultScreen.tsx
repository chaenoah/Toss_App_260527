import { useEffect, useRef, useState } from "react";
import { PROMO_ANALYSIS, PROMO_INVITE } from "../appConfig";
import { ResultCard } from "../components/ResultCard";
import { temperatureColors } from "../theme";
import type { ReadResult } from "../types";
import { saveCardImage } from "../utils/capture";
import { claimPromotion } from "../utils/promotion";
import { shareResult } from "../utils/share";

// 결과 화면.
// - 진입(분석 완료) 시 '읽씹 이유 확인하기' 보상(1원)을 하루 한 번 자동 지급
// - 최상단 CTA '친구 읽씹도 판독시키고 10원 받기' = 공유 + 10원 보상(하루 한 번)
// - 이미지로 저장 / 다시 판독하기

interface Props {
  result: ReadResult;
  onRestart: () => void;
}

// 분석완료 보상 자동 지급을 '세션당 1회'로 제한하기 위한 모듈 스코프 가드.
// (StrictMode의 이펙트 중복 실행/재진입에도 중복 시도하지 않게)
const autoGrantAttempted = new Set<string>();

export function ResultScreen({ result, onRestart }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<null | "invite" | "save">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);
  const colors = temperatureColors(result.temperature);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  };

  // 분석 완료 보상(1원) 자동 지급 — 하루 한 번
  useEffect(() => {
    if (autoGrantAttempted.has(PROMO_ANALYSIS.code)) return;
    autoGrantAttempted.add(PROMO_ANALYSIS.code);

    let alive = true;
    (async () => {
      const { result: claim } = await claimPromotion(PROMO_ANALYSIS);
      if (!alive) return;
      if (claim === "success") {
        setAnalysisNote(`분석 완료 보상 ${PROMO_ANALYSIS.amount}원 지급 완료 🎁`);
        showToast(`분석 완료 보상 ${PROMO_ANALYSIS.amount}원을 받았어요 🎁`);
      } else if (claim === "already") {
        setAnalysisNote("오늘 분석 보상은 이미 받았어요");
      }
      // unsupported/error → 조용히 넘어감(자동 지급이라 시끄럽지 않게)
    })();
    return () => {
      alive = false;
    };
  }, []);

  // 최상단 CTA: 공유(친구 유입) + 10원 보상
  const handleInvite = async () => {
    if (!cardRef.current || busy) return;
    setBusy("invite");
    try {
      // 1) 결과 카드 이미지 + 미니앱 링크 공유
      const outcome = await shareResult(cardRef.current, result);
      if (outcome === "cancelled") return; // 공유 취소 시 보상 없음

      // 이미지 전달 방식에 대한 안내(토스 WebView는 앨범 저장 후 첨부 유도)
      const shareNote =
        outcome === "saved+link"
          ? "이미지를 앨범에 저장했어요. 사진도 함께 올려주세요! "
          : outcome === "fallback"
            ? "링크를 복사했어요. 스크린샷으로 올려주세요. "
            : "";

      // 2) 10원 보상(하루 한 번)
      const { result: claim, message } = await claimPromotion(PROMO_INVITE);
      const rewardNote =
        claim === "success"
          ? `${PROMO_INVITE.amount}원 지급 🎉`
          : claim === "already"
            ? "오늘 보상은 이미 받았어요"
            : claim === "unsupported"
              ? "보상은 최신 버전에서 받을 수 있어요"
              : (message ?? "보상 지급에 실패했어요");

      showToast(`${shareNote}${rewardNote}`.trim());
    } catch {
      showToast("공유에 실패했어요. 스크린샷으로 공유해 주세요");
    } finally {
      setBusy(null);
    }
  };

  // 이미지만 저장
  const handleSave = async () => {
    if (!cardRef.current || busy) return;
    setBusy("save");
    try {
      const how = await saveCardImage(cardRef.current);
      if (how === "shared") showToast("공유 창을 열었어요");
      else if (how === "saved") showToast("이미지를 앨범에 저장했어요");
      else showToast("스크린샷으로 저장해 주세요");
    } catch {
      showToast("저장에 실패했어요. 스크린샷으로 저장해 주세요");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="screen result" style={{ background: colors.bg }}>
      <div className="result__scroll">
        {/* 캡처 대상 카드 */}
        <ResultCard ref={cardRef} result={result} />
      </div>

      {/* 분석 완료 보상 안내 */}
      {analysisNote && <p className="reward-note">✓ {analysisNote}</p>}

      {/* 하단 액션 (최상단 = 가장 잘 눌리는 위치에 보상 CTA) */}
      <div className="result__actions">
        <button
          type="button"
          className="primary-btn cta-reward"
          style={{ background: colors.accent }}
          onClick={handleInvite}
          disabled={busy !== null}
        >
          {busy === "invite" ? "공유 준비 중…" : `🎁 ${PROMO_INVITE.label}`}
        </button>
        <button
          type="button"
          className="secondary-btn"
          onClick={handleSave}
          disabled={busy !== null}
        >
          {busy === "save" ? "이미지 만드는 중…" : "이미지로 저장"}
        </button>
        <button
          type="button"
          className="ghost-btn"
          onClick={onRestart}
          disabled={busy !== null}
        >
          다시 판독하기
        </button>
      </div>

      {/* 간단 토스트 */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
