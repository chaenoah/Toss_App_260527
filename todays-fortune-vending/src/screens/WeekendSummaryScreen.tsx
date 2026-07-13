import { useEffect, useMemo } from "react";
import { getWeeklySummary } from "../logic/weeklySummary";
import { dateKey } from "../utils/date";
import { shareMessage } from "../sdk";
import { track, trackScreen } from "../utils/eventTracking";

interface Props {
  birth: string;
  onHome: () => void;
}

/** 주말 특집: 이번 주 재물운 총평 (Phase 3) */
export function WeekendSummaryScreen({ birth, onHome }: Props) {
  const today = dateKey();
  const summary = useMemo(() => getWeeklySummary(birth, today), [birth, today]);

  useEffect(() => {
    trackScreen("weekend_summary");
    track("weekend_summary_viewed", { avg: summary.avg });
  }, [summary.avg]);

  const share = async () => {
    const ok = await shareMessage(
      `이번 주 나의 재물운 평균 ${summary.avg}점! 💰\n` +
        `가장 좋은 날은 ${summary.best.label}요일 (${summary.best.score}점).\n` +
        `「오늘의 재물운 자판기」`,
    );
    if (ok) track("card_shared", { from: "weekend", avg: summary.avg });
  };

  return (
    <div className="screen">
      <header className="top">
        <div className="weekend-tag">🎉 주말 특집</div>
        <h1 className="title">이번 주 재물운 총평</h1>
        <p className="subtitle">이번 주 나의 재물 흐름을 한눈에 확인해요</p>
      </header>

      <div className="week-avg">
        <span className="week-avg-num">{summary.avg}</span>
        <span className="week-avg-unit">점</span>
        <span className="week-avg-label">주간 평균</span>
      </div>

      <div className="week-chart">
        {summary.days.map((d) => (
          <div className="week-bar-col" key={d.date}>
            <div className="week-bar-track">
              <div
                className={`week-bar-fill${d.isToday ? " today" : ""}`}
                style={{ height: `${d.score}%` }}
              />
            </div>
            <span className="week-bar-score">{d.score}</span>
            <span className={`week-bar-day${d.isToday ? " today" : ""}`}>{d.label}</span>
          </div>
        ))}
      </div>

      <div className="week-hilo">
        <div className="week-hilo-item best">
          <span className="week-hilo-key">베스트</span>
          <span className="week-hilo-val">
            {summary.best.label}요일 · {summary.best.score}점
          </span>
        </div>
        <div className="week-hilo-item worst">
          <span className="week-hilo-key">주의</span>
          <span className="week-hilo-val">
            {summary.worst.label}요일 · {summary.worst.score}점
          </span>
        </div>
      </div>

      <p className="week-comment">{summary.comment}</p>

      <button className="btn btn-primary block" onClick={share}>
        총평 공유하기
      </button>
      <button className="btn btn-ghost block" onClick={onHome}>
        홈으로
      </button>
    </div>
  );
}
