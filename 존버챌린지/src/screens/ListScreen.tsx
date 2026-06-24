import type { Challenge } from "../types";
import { daysSince, handTier } from "../util";
import { BottomBar, Btn, TopBar, tokens } from "../ui";

type Props = {
  challenges: Challenge[];
  onOpenNew: () => void;
  onOpenDetail: (id: string) => void;
};

export function ListScreen({ challenges, onOpenNew, onOpenDetail }: Props) {
  const sorted = [...challenges].sort((a, b) => a.startedAt - b.startedAt);

  return (
    <>
      <TopBar
        title="존버 챌린지"
        subtitle={
          challenges.length === 0
            ? "절대 안 판다. 그게 다야."
            : `${challenges.length}개 종목 존버 중`
        }
      />

      {challenges.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>💎</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: tokens.grey900 }}>
            아직 다이아 핸드 없음
          </div>
          <div style={{ fontSize: 15, color: tokens.grey600, marginTop: 8 }}>
            종목 하나 골라서 "절대 안 판다" 타이머를 켜봐.
          </div>
        </div>
      ) : (
        <div style={{ padding: "8px 16px" }}>
          {sorted.map((c) => {
            const days = daysSince(c.startedAt);
            const tier = handTier(days);
            return (
              <button
                key={c.id}
                onClick={() => onOpenDetail(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "20px 16px",
                  background: "#fff",
                  border: 0,
                  borderRadius: 16,
                  marginBottom: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: 36 }}>{tier.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: tokens.grey900 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 13, color: tokens.grey500, marginTop: 2 }}>
                    {tier.label} · {c.ticker}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: tokens.grey900, letterSpacing: -0.5 }}>
                    {days}
                  </div>
                  <div style={{ fontSize: 12, color: tokens.grey500 }}>일째</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ height: 120 }} />

      <BottomBar>
        <Btn variant="primary" onClick={onOpenNew}>
          + 새 챌린지 시작
        </Btn>
      </BottomBar>
    </>
  );
}
