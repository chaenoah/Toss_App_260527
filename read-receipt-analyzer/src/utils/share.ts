import { getTossShareLink, share } from "@apps-in-toss/web-framework";
import { DEEP_LINK, OG_IMAGE_URL } from "../appConfig";
import type { ReadResult } from "../types";
import { renderCardImage, saveImageToDevice } from "./capture";

// 공유 결과 종류 (UI 토스트 문구 분기용)
export type ShareOutcome =
  | "image+link" // 이미지 + 링크를 한 번에 공유(브라우저 Web Share)
  | "saved+link" // 이미지는 앨범에 저장 + 링크는 토스 공유(토스 WebView 기본 경로)
  | "link" // 이미지 저장 실패, 링크만 공유
  | "cancelled" // 사용자가 공유 취소
  | "fallback"; // 공유 시트 불가 → 링크 복사

// 공유 메시지: 이미지 없이 링크만 가더라도 결과가 드러나도록 온도·등급·멘트를 담는다.
function buildMessage(result: ReadResult, link: string): string {
  const { temperature, grade, comment } = result;
  return [
    `나와 그 사람의 관계 온도는 ${temperature}° — “${grade.label}”`,
    comment,
    "",
    `너도 판독해봐 👉 ${link}`,
  ].join("\n");
}

// 토스 공유 링크 생성. 실패 시(비-토스 환경 등) 딥링크 원문으로 폴백.
async function resolveShareLink(): Promise<string> {
  try {
    return await getTossShareLink(DEEP_LINK, OG_IMAGE_URL);
  } catch {
    return DEEP_LINK;
  }
}

// 결과를 '이미지 + 미니앱 링크'로 공유.
//
// 토스 SDK의 share()는 텍스트만 지원하고 이미지 파일 공유 API가 없다. 그래서:
//   1) 브라우저 Web Share(파일 지원)면 이미지+링크를 한 번에 공유
//   2) 토스 WebView면 이미지를 '앨범에 저장'(saveBase64Data) 후, 링크는 토스 share로 공유
//      → 사용자가 단톡방에 저장된 사진을 첨부 + 링크를 함께 올리는 흐름
export async function shareResult(
  el: HTMLElement,
  result: ReadResult,
): Promise<ShareOutcome> {
  const link = await resolveShareLink();
  const message = buildMessage(result, link);
  const fileName = "답장판독기_결과.png";

  const img = await renderCardImage(el);
  const file = new File([img.blob], fileName, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  // 1) 이미지 + 링크 한 번에: 브라우저 Web Share(파일 지원 시)
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: message });
      return "image+link";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return "cancelled";
      }
      // 그 외 오류는 다음 경로로
    }
  }

  // 2) 토스 WebView 경로: 이미지는 앨범에 저장, 링크는 토스 공유 시트로
  const saved = await saveImageToDevice(img, fileName);
  try {
    await share({ message });
    return saved ? "saved+link" : "link";
  } catch {
    // 3) 공유 시트도 불가 → 링크 클립보드 복사
    try {
      await navigator.clipboard?.writeText(link);
    } catch {
      // 무시
    }
    return saved ? "saved+link" : "fallback";
  }
}
