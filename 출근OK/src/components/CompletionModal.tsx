import { useEffect } from 'react';
import { getCompletionCopy, getMilestoneCopy, getShareCopy } from '../lib/copy';

interface Props {
  streak: number;
  isMilestone: boolean;
  onClose: () => void;
}

export function CompletionModal({ streak, isMilestone, onClose }: Props) {
  const copy = isMilestone ? getMilestoneCopy(streak) : getCompletionCopy(streak);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleShare() {
    const text = `${getShareCopy(streak)}\n\n#출근OK #직장인 #개근챌린지`;
    if (navigator.share) {
      navigator.share({ title: '출근 OK', text }).catch(() => {});
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => alert('클립보드에 복사됐어요 📋'));
    }
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
      </div>
    </div>
  );
}
