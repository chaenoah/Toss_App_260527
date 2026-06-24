import { useState } from "react";
import type { Challenge } from "../types";
import { daysSince, handTier } from "../util";
import { Btn, ConfirmModal, TopBar, tokens } from "../ui";

type Props = {
  challenge: Challenge;
  onBack: () => void;
  onSurrender: () => void;
};

export function DetailScreen({ challenge, onBack, onSurrender }: Props) {
  const days = daysSince(challenge.startedAt);
  const tier = handTier(days);
  const [confirming, setConfirming] = useState(false);

  const startedDate = new Date(challenge.startedAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <TopBar
        title={challenge.name}
        subtitle={challenge.ticker}
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

      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 88, lineHeight: 1, marginBottom: 8 }}>{tier.emoji}</div>

        <div
          style={{
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: -3,
            color: tokens.grey900,
            lineHeight: 1,
          }}
        >
          {days}
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: tokens.grey700, marginTop: 4 }}>
          일째 존버
        </div>

        <div
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: 999,
            background: tokens.blueBg,
            color: tokens.blue,
            fontWeight: 700,
            fontSize: 15,
            marginTop: 20,
          }}
        >
          {tier.label}
        </div>

        <div style={{ fontSize: 14, color: tokens.grey500, marginTop: 24 }}>
          {startedDate} 부터 안 팔고 있어
        </div>
      </div>

      <div style={{ padding: "0 16px 24px" }}>
        <div
          style={{
            background: tokens.grey50,
            borderRadius: 16,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <Tier label="신생 손 👋" range="0~6일" hit={days < 7} />
          <Tier label="굳은살 ✊" range="7~29일" hit={days >= 7 && days < 30} />
          <Tier label="강철 손 🦾" range="30~99일" hit={days >= 30 && days < 100} />
          <Tier label="다이아 핸드 💎" range="100~299일" hit={days >= 100 && days < 300} />
          <Tier label="전설의 존버 🏆" range="300일+" hit={days >= 300} />
        </div>
      </div>

      <div
        style={{
          padding: "0 16px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Btn
          variant="primary"
          onClick={() =>
            navigator.share?.({
              title: "존버 챌린지",
              text: `나 ${challenge.name} ${days}일째 ${tier.label} ${tier.emoji}`,
            }).catch(() => {})
          }
        >
          자랑하기
        </Btn>
        <Btn variant="danger" onClick={() => setConfirming(true)}>
          포기 (팔았어요)
        </Btn>
      </div>

      {confirming && (
        <ConfirmModal
          title="정말 팔거야?"
          description={`${challenge.name} ${days}일 존버 기록이 묘비에 새겨지고 사라져. 되돌릴 수 없어.`}
          primaryLabel="아냐 안 팔아"
          secondaryLabel="포기할게"
          onPrimary={() => setConfirming(false)}
          onSecondary={() => {
            setConfirming(false);
            onSurrender();
          }}
        />
      )}
    </>
  );
}

function Tier({ label, range, hit }: { label: string; range: string; hit: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: hit ? 1 : 0.35,
        fontWeight: hit ? 700 : 500,
        color: tokens.grey900,
      }}
    >
      <span>{label}</span>
      <span style={{ color: hit ? tokens.blue : tokens.grey500, fontSize: 14 }}>{range}</span>
    </div>
  );
}
