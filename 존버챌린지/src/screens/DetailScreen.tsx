import { useState } from "react";
import type { Challenge } from "../types";
import { daysSince, handTier } from "../util";
import { Btn, ConfirmModal, TopBar, tokens } from "../ui";
import { showInterstitial } from "../ads";

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
        subtitle={`종목코드 ${challenge.ticker}`}
        left={
          <button
            onClick={onBack}
            aria-label="목록으로 돌아가기"
            style={{
              background: "none",
              border: 0,
              color: tokens.grey700,
              fontSize: 15,
              cursor: "pointer",
              padding: "8px 0",
            }}
          >
            ← 목록
          </button>
        }
      />

      <div style={{ padding: "32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 88, lineHeight: 1, marginBottom: 8 }} aria-hidden="true">
          {tier.emoji}
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-label={`${days}일째 존버 중, ${tier.label}`}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              letterSpacing: -3,
              color: tokens.grey900,
              lineHeight: 1,
            }}
            aria-hidden="true"
          >
            {days}
          </div>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: tokens.grey700, marginTop: 4 }}
            aria-hidden="true"
          >
            일째 존버
          </div>
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
          aria-hidden="true"
        >
          {tier.label}
        </div>

        <div style={{ fontSize: 14, color: tokens.grey600, marginTop: 24 }}>
          <time dateTime={new Date(challenge.startedAt).toISOString()}>{startedDate}</time>
          {" "}부터 안 팔고 있어
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
          aria-label="단계 진행도"
          role="list"
        >
          <Tier label="신생 손" emoji="👋" range="0~6일" hit={days < 7} />
          <Tier label="굳은살" emoji="✊" range="7~29일" hit={days >= 7 && days < 30} />
          <Tier label="강철 손" emoji="🦾" range="30~99일" hit={days >= 30 && days < 100} />
          <Tier label="다이아 핸드" emoji="💎" range="100~299일" hit={days >= 100 && days < 300} />
          <Tier label="전설의 존버" emoji="🏆" range="300일+" hit={days >= 300} />
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
          aria-label={`${challenge.name} ${days}일째 자랑하기`}
          onClick={() =>
            navigator.share?.({
              title: "존버 챌린지",
              text: `나 ${challenge.name} ${days}일째 ${tier.label} ${tier.emoji}`,
            }).catch(() => {})
          }
        >
          자랑하기
        </Btn>
        <Btn
          variant="danger"
          onClick={() => setConfirming(true)}
          aria-label="챌린지 포기하고 매도하기"
        >
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
            void showInterstitial().finally(onSurrender);
          }}
        />
      )}
    </>
  );
}

function Tier({
  label,
  emoji,
  range,
  hit,
}: {
  label: string;
  emoji: string;
  range: string;
  hit: boolean;
}) {
  return (
    <div
      role="listitem"
      aria-label={`${label}, ${range}${hit ? ", 현재 단계" : ""}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: hit ? 1 : 0.45,
        fontWeight: hit ? 700 : 500,
        color: tokens.grey900,
      }}
    >
      <span>
        {label} <span aria-hidden="true">{emoji}</span>
      </span>
      <span style={{ color: hit ? tokens.blue : tokens.grey600, fontSize: 14 }}>{range}</span>
    </div>
  );
}
