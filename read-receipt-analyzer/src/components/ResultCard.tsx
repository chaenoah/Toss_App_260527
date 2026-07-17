import { forwardRef } from "react";
import { temperatureColors } from "../theme";
import type { ReadResult } from "../types";
import { TemperatureGauge } from "./TemperatureGauge";

// 캡처해서 단톡방에 올릴 '한 장'의 결과 카드.
// 온도 게이지 + 등급 + 저격 멘트 + 하단 고정 문구로 구성.
// html2canvas 캡처 대상이라 ref를 forward한다.

interface Props {
  result: ReadResult;
}

export const ResultCard = forwardRef<HTMLDivElement, Props>(function ResultCard(
  { result },
  ref,
) {
  const { temperature, grade, comment } = result;
  const colors = temperatureColors(temperature);

  return (
    <div
      ref={ref}
      className="card"
      style={{ background: colors.bg, borderColor: colors.soft }}
    >
      {/* 상단: 등급 뱃지 */}
      <div
        className="card__badge"
        style={{ background: colors.accent, color: "#fff" }}
      >
        {grade.label}
      </div>

      <p className="card__lead">이 관계의 온도는</p>

      {/* 온도 게이지 */}
      <TemperatureGauge temperature={temperature} accent={colors.accent} />

      {/* 저격 멘트 */}
      <p className="card__comment">“{comment}”</p>

      {/* 하단 고정 브랜딩 문구 (유입 핵심) */}
      <div className="card__footer" style={{ borderColor: colors.soft }}>
        <span className="card__footer-title">읽씹 판독기</span>
        <span className="card__footer-sub">토스에서 검색</span>
      </div>
    </div>
  );
});
