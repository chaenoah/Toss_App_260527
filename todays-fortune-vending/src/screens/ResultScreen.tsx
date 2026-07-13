import { useEffect, useState } from "react";
import type { Fortune } from "../logic/fortuneEngine";
import { ShareCard } from "../components/ShareCard";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { useRewardAd } from "../hooks/useRewardAd";
import { track } from "../utils/eventTracking";
import { haptic } from "../sdk";

interface Props {
  fortune: Fortune;
  streak: number;
  onHome: () => void;
}

/** 결과 화면: 점수 + 코멘트 + 소비 처방 + 공유 카드 + 복주머니(리워드). */
export function ResultScreen({ fortune, onHome }: Props) {
  const { maybeShowInterstitial } = useInterstitialAd();
  const { showRewardedAd } = useRewardAd();
  const [detailUnlocked, setDetailUnlocked] = useState(false);
  const [loadingAd, setLoadingAd] = useState(false);

  // 결과 진입 시 전면 광고 1회(빈도 제한 적용).
  useEffect(() => {
    void maybeShowInterstitial();
  }, [maybeShowInterstitial]);

  const unlockDetail = async () => {
    setLoadingAd(true);
    haptic("tap");
    const rewarded = await showRewardedAd();
    setLoadingAd(false);
    if (rewarded) {
      setDetailUnlocked(true);
      haptic("confetti");
      track("detail_report_unlocked", { score: fortune.score });
    }
  };

  return (
    <div className="screen">
      <div className="result">
        <div className="result-emoji">{fortune.emoji}</div>
        <div className="result-grade">{fortune.grade}</div>

        <div className="meter">
          <div
            className="meter-fill"
            style={{ width: `${fortune.score}%`, background: fortune.luckyColor.hex }}
          />
          <span className="meter-score">{fortune.score}점</span>
        </div>

        <p className="result-comment">{fortune.comment}</p>

        <div className="prescription">💊 {fortune.prescription}</div>

        <div className="saju">
          <span className="saju-chip">{fortune.dayMaster.label}</span>
          <span className="saju-chip">{fortune.today.label}</span>
          <span className="saju-chip">{fortune.sipsin}</span>
        </div>

        <div className="lucky-grid">
          <div className="lucky">
            <span className="lucky-key">행운의 색</span>
            <span className="lucky-val">
              <span className="dot" style={{ background: fortune.luckyColor.hex }} />
              {fortune.luckyColor.name}
            </span>
          </div>
          <div className="lucky">
            <span className="lucky-key">행운의 방향</span>
            <span className="lucky-val">{fortune.luckyDirection}</span>
          </div>
          <div className="lucky">
            <span className="lucky-key">행운의 아이템</span>
            <span className="lucky-val">{fortune.luckyItem}</span>
          </div>
        </div>

        <ShareCard fortune={fortune} />

        {detailUnlocked ? (
          <div className="detail-report">
            <div className="detail-title">🧧 상세 재물운 리포트</div>
            <p>
              오늘의 <b>{fortune.sipsin}</b> 기운은 지출보다 <b>흐름 관리</b>가 핵심이에요.
              행운의 방향 <b>{fortune.luckyDirection}</b>을 향해 앉아 일하면 집중이 붙고,
              <b> {fortune.luckyColor.name}</b> 소품이 금전 감각을 깨워줘요.
            </p>
            <p className="detail-sub">연애운 · 직장운은 다음 업데이트에서 열려요.</p>
          </div>
        ) : (
          <button className="btn btn-gold block" onClick={unlockDetail} disabled={loadingAd}>
            {loadingAd ? "복주머니 여는 중…" : "🧧 복주머니 더 열어보기"}
          </button>
        )}

        <button className="btn btn-ghost block" onClick={onHome}>
          홈으로
        </button>
      </div>
    </div>
  );
}
