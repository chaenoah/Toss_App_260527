import { useEffect } from 'react';
import { getCompletionCopy, getMilestoneCopy, getShareCopy } from '../lib/copy';
import { shareWithReward } from '../lib/shareReward';
import type { PromoStatus } from '../hooks/usePromotion';

interface Props {
  streak: number;
  isMilestone: boolean;
  promoStatus: PromoStatus;
  onClose: () => void;
}

const PROMO_NOTICE =
  '출근 체크 완료 시 토스포인트 10원 지급 · 1인 1일 1회 · 예산 소진 시 조기 종료될 수 있어요';

export function CompletionModal({ streak, isMilestone, promoStatus, onClose }: Props) {
  const copy = isMilestone ? getMilestoneCopy(streak) : getCompletionCopy(streak);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleShare() {
    const text = `${getShareCopy(streak)}\n\n#출근OK #직장인 #개근챌린지`;
    void shareWithReward(text);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${isMilestone ? 'modal--milestone' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 마일스톤 배지 */}
        {isMilestone && (
          <div className="modal__milestone-badge">🎊 마일스톤 달성!</div>
        )}

        <div className="modal__confetti">{isMilestone ? '🎊' : '🎉'}</div>
        <h2 className="modal__title">{copy.title}</h2>
        <p className="modal__sub">{copy.sub}</p>

        <div className={`modal__streak ${isMilestone ? 'modal__streak--milestone' : ''}`}>
          {streak > 0 ? `🔥 ${streak}일 연속 출근` : '🌱 오늘부터 streak 시작!'}
        </div>

        {/* 프로모션 지급 상태 */}
        {promoStatus === 'granted' && (
          <div className="modal__promo modal__promo--granted">토스포인트 10원 지급 완료 💰</div>
        )}
        {promoStatus === 'already' && (
          <div className="modal__promo modal__promo--already">오늘 포인트는 이미 받았어요</div>
        )}

        {/* 공유 카드 미리보기 */}
        <div className="modal__share-card">
          <div className="modal__share-card-title">출근 OK 🫡</div>
          <div className="modal__share-card-body">{getShareCopy(streak)}</div>
        </div>

        <div className="modal__actions">
          <button className="modal__share-btn" onClick={handleShare}>
            공유하기 📤
          </button>
          <button className="modal__close-btn" onClick={onClose}>
            확인
          </button>
        </div>

        <div className="modal__promo-notice">{PROMO_NOTICE}</div>
      </div>
    </div>
  );
}
