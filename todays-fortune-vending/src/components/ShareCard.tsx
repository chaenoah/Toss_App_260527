import { useEffect, useRef, useState } from "react";
import type { Fortune } from "../logic/fortuneEngine";
import { saveImage, shareMessage } from "../sdk";
import { track } from "../utils/eventTracking";
import { grantShareRewardOncePerDay } from "../logic/bokjumeoni";

interface Props {
  fortune: Fortune;
  /** 공유 보상으로 복주머니를 받으면 호출돼요 (부모가 개수 갱신). */
  onReward?: (count: number) => void;
}

const SIZE = 1080; // 1:1 정사각형 (인스타/카톡 공유 최적화)
const APP_NAME = "오늘의 재물운 자판기";

/** 결과를 1:1 이미지 카드로 렌더링하고, 공유/저장 버튼을 제공해요. */
export function ShareCard({ fortune, onReward }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [toast, setToast] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCard(ctx, fortune);
    setPreview(canvas.toDataURL("image/png"));
  }, [fortune]);

  const shareText =
    `${fortune.grade} ${fortune.score}점! 💰\n` +
    `오늘 나의 재물운은? 「${APP_NAME}」에서 확인해보세요.`;

  const handleShare = async () => {
    const ok = await shareMessage(shareText);
    if (!ok) return;
    track("card_shared", { score: fortune.score, sipsin: fortune.sipsin });
    // 공유 보상: 하루 1회 복주머니 +1
    const { granted, count } = await grantShareRewardOncePerDay();
    if (granted) {
      track("share_reward_granted", { count });
      onReward?.(count);
      setToast("복주머니 +1 🧧");
      window.setTimeout(() => setToast(""), 2000);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    const base64 = preview.replace(/^data:image\/png;base64,/, "");
    await saveImage(base64, `jaemulun-${fortune.date}.png`);
  };

  return (
    <div className="share-card">
      {/* 화면 밖 캔버스(실렌더용). 미리보기는 아래 img 로 보여줘요. */}
      <canvas
        ref={canvasRef}
        width={SIZE}
        height={SIZE}
        style={{ display: "none" }}
      />
      {preview && (
        <img className="share-preview" src={preview} alt="오늘의 재물운 카드" />
      )}
      <div className="share-actions">
        <button className="btn btn-primary" onClick={handleShare}>
          공유하기
        </button>
        <button className="btn btn-ghost" onClick={handleSave}>
          이미지 저장
        </button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function drawCard(ctx: CanvasRenderingContext2D, f: Fortune) {
  const S = SIZE;
  // 배경 (다크 → 딥퍼플)
  const bg = ctx.createLinearGradient(0, 0, 0, S);
  bg.addColorStop(0, "#241b3a");
  bg.addColorStop(1, "#120d20");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // 골드 테두리 (직각)
  ctx.strokeStyle = "rgba(245,166,35,0.55)";
  ctx.lineWidth = 10;
  ctx.strokeRect(40, 40, S - 80, S - 80);

  ctx.textAlign = "center";

  // 상단 라벨
  ctx.fillStyle = "#F5A623";
  ctx.font = "700 44px sans-serif";
  ctx.fillText("오늘의 재물운", S / 2, 150);

  // 이모지 + 등급
  ctx.font = "160px sans-serif";
  ctx.fillText(f.emoji, S / 2, 360);
  ctx.fillStyle = "#FFD35A";
  ctx.font = "800 78px sans-serif";
  ctx.fillText(f.grade, S / 2, 470);

  // 점수
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 200px sans-serif";
  ctx.fillText(String(f.score), S / 2, 700);
  ctx.fillStyle = "#c9c4dc";
  ctx.font = "600 52px sans-serif";
  ctx.fillText("점", S / 2 + measureOffset(ctx, f.score), 700);

  // 코멘트
  ctx.fillStyle = "#efeaff";
  ctx.font = "500 42px sans-serif";
  wrapText(ctx, f.comment, S / 2, 800, S - 200, 56);

  // 행운 요약
  ctx.fillStyle = "#F5A623";
  ctx.font = "700 40px sans-serif";
  ctx.fillText(
    `행운의 색 ${f.luckyColor.name} · 방향 ${f.luckyDirection}`,
    S / 2,
    920,
  );

  // 워터마크 (재유입 유도)
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 36px sans-serif";
  ctx.fillText(`📲 ${APP_NAME}`, S / 2, 1010);
}

// 점수 뒤 '점' 위치를 대략 맞추기 위한 오프셋
function measureOffset(ctx: CanvasRenderingContext2D, score: number): number {
  ctx.save();
  ctx.font = "900 200px sans-serif";
  const w = ctx.measureText(String(score)).width;
  ctx.restore();
  return w / 2 + 48;
}

// 긴 텍스트 줄바꿈
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = w;
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}
