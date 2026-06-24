import { useMemo, useState } from "react";
import { searchStocks, type Stock } from "../stocks";
import { BottomBar, Btn, ConfirmModal, TopBar, tokens } from "../ui";

type Props = {
  onBack: () => void;
  onCommit: (stock: Stock) => void;
  excludeTickers: Set<string>;
};

export function NewScreen({ onBack, onCommit, excludeTickers }: Props) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Stock | null>(null);
  const [confirming, setConfirming] = useState(false);

  const results = useMemo(
    () => searchStocks(query).filter((s) => !excludeTickers.has(s.ticker)),
    [query, excludeTickers],
  );

  return (
    <>
      <TopBar
        title="종목 선택"
        subtitle="다이아 핸드로 들고 갈 종목을 골라."
        left={
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: 0,
              color: tokens.grey700,
              fontSize: 15,
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← 목록
          </button>
        }
      />

      <div style={{ padding: "12px 16px 8px" }}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="종목명 또는 코드 검색"
          style={{
            width: "100%",
            border: 0,
            borderRadius: 12,
            padding: "16px 18px",
            fontSize: 17,
            background: tokens.grey100,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ padding: "0 16px" }}>
        {results.map((s) => {
          const isPicked = picked?.ticker === s.ticker;
          return (
            <button
              key={s.ticker}
              onClick={() => setPicked(s)}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                padding: "16px",
                background: isPicked ? tokens.blueBg : "#fff",
                border: 0,
                borderRadius: 12,
                marginBottom: 4,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: tokens.grey900 }}>
                  {s.name}
                </div>
                <div style={{ fontSize: 13, color: tokens.grey500, marginTop: 2 }}>
                  {s.market} · {s.ticker}
                </div>
              </div>
              {isPicked && (
                <div style={{ fontSize: 14, fontWeight: 700, color: tokens.blue }}>
                  선택됨
                </div>
              )}
            </button>
          );
        })}
        {results.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: tokens.grey500 }}>
            검색 결과가 없어.
          </div>
        )}
      </div>

      <div style={{ height: 140 }} />

      <BottomBar>
        <div style={{ flex: 1 }}>
          <Btn
            variant="primary"
            disabled={!picked}
            onClick={() => setConfirming(true)}
          >
            {picked ? `${picked.name} 존버 시작` : "종목을 골라"}
          </Btn>
        </div>
      </BottomBar>

      {confirming && picked && (
        <ConfirmModal
          title="정말 안 팔거야?"
          description={`${picked.name} — 한 번 시작하면 타이머는 멈추지 않아. 팔면 0일로 리셋되고 묘비에 새겨져.`}
          primaryLabel={`💎 다이아 핸드 시작`}
          secondaryLabel="다시 생각"
          onPrimary={() => {
            setConfirming(false);
            onCommit(picked);
          }}
          onSecondary={() => setConfirming(false)}
        />
      )}
    </>
  );
}
