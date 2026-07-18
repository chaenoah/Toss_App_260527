// 결과 카드 DOM을 이미지(PNG)로 렌더/저장하는 유틸.
// 공유 로직은 share.ts에서 이 함수들을 재사용한다.

// 카드 엘리먼트를 PNG Blob으로 변환
export async function renderCardToPng(el: HTMLElement): Promise<Blob> {
  // html2canvas는 용량이 커서 실제 사용할 때만 동적 import (초기 로딩 가볍게)
  const { default: html2canvas } = await import("html2canvas");
  const canvas = await html2canvas(el, {
    backgroundColor: null, // 카드 자체 배경 사용
    scale: Math.min(window.devicePixelRatio || 1, 3), // 선명하게(최대 3배)
    useCORS: true,
    logging: false,
  });
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas → blob 실패"))),
      "image/png",
      1,
    );
  });
}

// Blob을 브라우저 다운로드로 저장
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export type SaveResult = "shared" | "downloaded" | "fallback";

// 결과 카드를 '이미지로 저장'. (이미지 단독 저장/공유 버튼용)
// Web Share(파일) → 다운로드 → 스크린샷 안내 순으로 폴백.
export async function saveCardImage(
  el: HTMLElement,
  fileName = "답장판독기_결과.png",
): Promise<SaveResult> {
  const blob = await renderCardToPng(el);
  const file = new File([blob], fileName, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "답장 판독기 결과" });
      return "shared";
    } catch {
      // 취소 → 다음 폴백
    }
  }

  try {
    downloadBlob(blob, fileName);
    return "downloaded";
  } catch {
    return "fallback";
  }
}
