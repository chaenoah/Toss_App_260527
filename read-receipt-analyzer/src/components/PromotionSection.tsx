import { useEffect, useState } from "react";
import { PROMOTIONS } from "../appConfig";
import { claimPromotion, hasClaimedToday } from "../utils/promotion";

// 결과 화면 하단 프로모션 영역.
// 각 프로모션 버튼은 '1일 1회'만 참여 가능. 오늘 이미 참여했으면 비활성화된다.

interface Props {
  onNotify: (message: string) => void; // 결과 화면의 토스트 재사용
}

export function PromotionSection({ onNotify }: Props) {
  // 프로모션 코드 → 오늘 참여 완료 여부
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  // 프로모션 코드 → 지급 처리 중 여부
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // 마운트 시 각 프로모션의 '오늘 참여 여부'를 조회해 초기 상태 세팅
  useEffect(() => {
    let alive = true;
    (async () => {
      const entries = await Promise.all(
        PROMOTIONS.map(
          async (p) => [p.code, await hasClaimedToday(p.code)] as const,
        ),
      );
      if (alive) setClaimed(Object.fromEntries(entries));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleClaim = async (code: string) => {
    const promo = PROMOTIONS.find((p) => p.code === code);
    if (!promo || loading[code] || claimed[code]) return;

    setLoading((s) => ({ ...s, [code]: true }));
    try {
      const { result, message } = await claimPromotion(promo);
      switch (result) {
        case "success":
          setClaimed((s) => ({ ...s, [code]: true }));
          onNotify(`${promo.amount}포인트를 받았어요! 🎉`);
          break;
        case "already":
          setClaimed((s) => ({ ...s, [code]: true }));
          onNotify("오늘은 이미 참여했어요. 내일 다시 만나요!");
          break;
        case "unsupported":
          onNotify("토스 앱을 최신 버전으로 업데이트해 주세요");
          break;
        default:
          onNotify(message ?? "잠시 후 다시 시도해 주세요");
      }
    } finally {
      setLoading((s) => ({ ...s, [code]: false }));
    }
  };

  return (
    <div className="promo">
      <div className="promo__head">
        <span className="promo__title">🎁 이벤트</span>
        <span className="promo__badge">하루 한 번</span>
      </div>

      <div className="promo__list">
        {PROMOTIONS.map((p) => {
          const isDone = claimed[p.code];
          const isLoading = loading[p.code];
          return (
            <button
              key={p.code}
              type="button"
              className={`promo__btn${isDone ? " promo__btn--done" : ""}`}
              onClick={() => handleClaim(p.code)}
              disabled={isDone || isLoading}
            >
              <span className="promo__btn-label">{p.label}</span>
              <span className="promo__btn-right">
                {isDone
                  ? "오늘 완료 ✓"
                  : isLoading
                    ? "지급 중…"
                    : `+${p.amount}P`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
