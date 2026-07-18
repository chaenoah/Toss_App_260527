import { saveBase64Data } from "@apps-in-toss/web-framework";

// 결과 카드 DOM을 이미지(PNG)로 렌더하고 기기에 저장하는 유틸.
// 공유 로직(share.ts)에서 재사용한다.

// html2canvas로 카드를 캔버스로 렌더
async function renderCanvas(el: HTMLElement): Promise<HTMLCanvasElement> {
  // html2canvas는 용량이 커서 실제 사용할 때만 동적 import (초기 로딩 가볍게)
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(el, {
    backgroundColor: null, // 카드 자체 배경 사용
    scale: Math.min(window.devicePixelRatio || 1, 3), // 선명하게(최대 3배)
    useCORS: true,
    logging: false,
  });
}

export interface RenderedImage {
  blob: Blob; // Web Share / 브라우저 다운로드용
  base64: string; // 토스 saveBase64Data용 (data: 프리픽스 제거된 순수 base64)
}

// 카드를 한 번만 렌더해서 blob·base64를 동시에 얻는다.
export async function renderCardImage(el: HTMLElement): Promise<RenderedImage> {
  const canvas = await renderCanvas(el);
  const base64 = (canvas.toDataURL("image/png").split(",")[1] ?? "");
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("canvas → blob 실패"))),
      "image/png",
      1,
    );
  });
  return { blob, base64 };
}

// Blob을 브라우저 다운로드로 저장 (일반 브라우저 폴백용)
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

// 이미지를 기기에 저장. 토스 네이티브(saveBase64Data=앨범 저장) 우선, 실패 시 브라우저 다운로드.
// 반환: 저장 성공 여부
export async function saveImageToDevice(
  img: RenderedImage,
  fileName: string,
): Promise<boolean> {
  try {
    // 토스 앱: 사진 앱/앨범에 저장됨
    await saveBase64Data({
      data: img.base64,
      fileName,
      mimeType: "image/png",
    });
    return true;
  } catch {
    // 일반 브라우저: 다운로드로 폴백
    try {
      downloadBlob(img.blob, fileName);
      return true;
    } catch {
      return false;
    }
  }
}

export type SaveResult = "shared" | "saved" | "fallback";

// '이미지로 저장' 버튼용: Web Share(파일) → 네이티브 앨범 저장 → 실패 순.
export async function saveCardImage(
  el: HTMLElement,
  fileName = "답장판독기_결과.png",
): Promise<SaveResult> {
  const img = await renderCardImage(el);
  const file = new File([img.blob], fileName, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "답장 판독기 결과" });
      return "shared";
    } catch {
      // 취소 → 저장으로 폴백
    }
  }

  const ok = await saveImageToDevice(img, fileName);
  return ok ? "saved" : "fallback";
}
