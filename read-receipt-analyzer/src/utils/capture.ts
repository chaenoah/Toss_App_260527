// 결과 카드 DOM을 이미지로 캡처해서 저장/공유하는 유틸.
//
// 앱인토스 WebView 환경에서는 일반 다운로드가 막힐 수 있어 여러 방법을 순차 시도한다.
//   1) html2canvas로 카드를 PNG(Blob)로 렌더
//   2) Web Share API(파일 공유)가 되면 공유 시트로 저장/전송  ← 모바일에서 가장 자연스러움
//   3) 안 되면 <a download>로 브라우저 저장 시도
//   4) 그래도 안 되면 "스크린샷으로 저장" 안내
//
// 참고: 실제 기기 동작은 반드시 토스 샌드박스 앱에서 검증하세요.

export type SaveResult = "shared" | "downloaded" | "fallback";

// 카드 엘리먼트를 PNG Blob으로 변환
async function elementToPngBlob(el: HTMLElement): Promise<Blob> {
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

// 결과 카드를 이미지로 저장/공유. 반환값으로 어떤 경로를 탔는지 알려준다.
export async function saveCardImage(
  el: HTMLElement,
  fileName = "읽씹판독기_결과.png",
): Promise<SaveResult> {
  const blob = await elementToPngBlob(el);
  const file = new File([blob], fileName, { type: "image/png" });

  // 2) Web Share API로 파일 공유 (지원 & 파일 공유 가능할 때)
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: "읽씹 판독기 결과" });
      return "shared";
    } catch {
      // 사용자가 공유 취소 → 다음 폴백으로
    }
  }

  // 3) 브라우저 다운로드 시도
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return "downloaded";
  } catch {
    // 4) 최종 폴백
    return "fallback";
  }
}
