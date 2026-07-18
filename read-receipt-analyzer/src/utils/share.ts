import { getTossShareLink, share } from "@apps-in-toss/web-framework";
import { DEEP_LINK, OG_IMAGE_URL } from "../appConfig";
import type { ReadResult } from "../types";
import { downloadBlob, renderCardToPng } from "./capture";

// 공유 결과 종류 (UI 토스트 문구 분기용)
export type ShareOutcome =
  | "image+link" // 이미지 + 링크를 함께 공유(가장 이상적)
  | "link" // 링크만 공유(토스 네이티브) + 이미지 저장
  | "cancelled" // 사용자가 공유 취소
  | "fallback"; // 공유 불가 → 링크 복사 + 이미지 저장

// 결과를 바탕으로 공유 메시지를 구성. 캡처 이미지와 별개로, 이미지 없이 링크만
// 전달될 때에도 결과가 드러나도록 온도·등급·멘트를 담는다.
function buildMessage(result: ReadResult, link: string): string {
  const { temperature, grade, comment } = result;
  return [
    `나와 그 사람의 관계 온도는 ${temperature}° — “${grade.label}”`,
    comment,
    "",
    `너도 판독해봐 👉 ${link}`,
  ].join("\n");
}

// 토스 공유 링크를 생성. 실패 시(비-토스 환경 등) 딥링크 원문으로 폴백.
async function resolveShareLink(): Promise<string> {
  try {
    return await getTossShareLink(DEEP_LINK, OG_IMAGE_URL);
  } catch {
    return DEEP_LINK;
  }
}

// 결과 카드(el)를 '결과 화면 그대로 이미지 + 미니앱 링크'로 공유.
// 플랫폼별로 가능한 최선의 경로를 순차 시도한다.
export async function shareResult(
  el: HTMLElement,
  result: ReadResult,
): Promise<ShareOutcome> {
  const link = await resolveShareLink();
  const message = buildMessage(result, link);
  const fileName = "답장판독기_결과.png";

  // 1) 이미지 + 링크를 한 번에: 브라우저 Web Share(파일 지원 시)
  //    → 결과 화면 그대로(이미지) + 링크 텍스트가 함께 공유된다.
  const blob = await renderCardToPng(el);
  const file = new File([blob], fileName, { type: "image/png" });
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text: message });
      return "image+link";
    } catch (e) {
      // 사용자가 취소한 경우엔 여기서 종료
      if (e instanceof DOMException && e.name === "AbortError") {
        return "cancelled";
      }
      // 그 외 오류는 다음 폴백으로
    }
  }

  // 2) 이미지 파일 공유 불가 → 토스 네이티브 공유(share)로 링크 텍스트 전달.
  //    토스 share는 텍스트만 지원하므로, 카드 이미지는 따로 저장해 첨부하도록 안내.
  try {
    downloadBlob(blob, fileName); // 첨부용 이미지 먼저 저장
    await share({ message });
    return "link";
  } catch {
    // 3) 최종 폴백: 링크 클립보드 복사 + 이미지 저장
    try {
      await navigator.clipboard?.writeText(link);
    } catch {
      // 클립보드도 막히면 무시
    }
    return "fallback";
  }
}
