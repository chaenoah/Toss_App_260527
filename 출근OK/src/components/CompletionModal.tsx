import { useEffect } from 'react';
import { getCompletionCopy } from '../lib/copy';

interface Props {
  streak: number;
  onClose: () => void;
}

export function CompletionModal({ streak, onClose }: Props) {
  const { title, sub } = getCompletionCopy(streak);

  // 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function handleShare() {
    const text = `${title}\n${sub}\n\n#출근OK #직장인 #개근`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => alert('클립보드에 복사됐어요 📋'));
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__confetti">🎉</div>
        <h2 className="modal__title">{title}</h2>
        <p className="modal__sub">{sub}</p>
        {streak > 0 && (
          <div className="modal__streak">
            🔥 {streak}일 연속 출근
          </div>
        )}
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
