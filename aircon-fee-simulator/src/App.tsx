import { useEffect, useMemo, useState } from "react";
import "./App.css";

/* ────────────────────────────────────────────────────────────────────────
 * 한전 주택용 전력(저압) 누진 요금표 — 근사치
 * ⚠️ 단가·기본요금·부가 요금은 개정됩니다. 실제 서비스 전에 한전 공식 요금표
 *    또는 최근 고지서 기준으로 아래 상수를 반드시 갱신하세요.
 * ──────────────────────────────────────────────────────────────────────── */
const RATE_AS_OF = "2024년 주택용 저압 기준 (근사치)";
const CLIMATE_CHARGE = 9.0; // 기후환경요금 (원/kWh)
const FUEL_CHARGE = 5.0; // 연료비조정요금 (원/kWh)
const VAT_RATE = 0.1; // 부가가치세
const FUND_RATE = 0.037; // 전력산업기반기금

type Tier = { upTo: number; price: number; baseFee: number };

// 기타계절(봄·가을·겨울)
const NORMAL_TIERS: Tier[] = [
  { upTo: 200, price: 120.0, baseFee: 910 },
  { upTo: 400, price: 214.6, baseFee: 1600 },
  { upTo: Infinity, price: 307.3, baseFee: 7300 },
];
// 하계(7~8월) 누진구간 확대
const SUMMER_TIERS: Tier[] = [
  { upTo: 300, price: 120.0, baseFee: 910 },
  { upTo: 450, price: 214.6, baseFee: 1600 },
  { upTo: Infinity, price: 307.3, baseFee: 7300 },
];

function tiersForMonth(month1to12: number): Tier[] {
  return month1to12 === 7 || month1to12 === 8 ? SUMMER_TIERS : NORMAL_TIERS;
}

/** 총 사용량(kWh) → 청구요금 상세 (누진 + 부가요금 + 세금) */
function calcBill(kwh: number, tiers: Tier[]) {
  const usage = Math.max(0, kwh);
  let energy = 0;
  let prev = 0;
  let baseFee = tiers[0].baseFee;
  for (const t of tiers) {
    if (usage <= prev) break;
    const inTier = Math.min(usage, t.upTo) - prev;
    energy += inTier * t.price;
    baseFee = t.baseFee; // 도달한 최고 구간의 기본요금
    prev = t.upTo;
  }
  const supply = baseFee + energy; // 전기요금계
  const climate = usage * CLIMATE_CHARGE;
  const fuel = usage * FUEL_CHARGE;
  const preTax = supply + climate + fuel;
  const vat = preTax * VAT_RATE;
  const fund = preTax * FUND_RATE;
  const total = Math.round((preTax + vat + fund) / 10) * 10; // 10원 단위 절사
  return { total, supply, baseFee, energy, climate, fuel, vat, fund };
}

/** 현재 누적 kWh 기준: 현재 단계 / 다음 단계까지 남은 kWh */
function nextTierInfo(kwh: number, tiers: Tier[]) {
  for (let i = 0; i < tiers.length - 1; i++) {
    if (kwh <= tiers[i].upTo) {
      return {
        currentStage: i + 1,
        nextStage: i + 2,
        threshold: tiers[i].upTo,
        remaining: Math.max(0, tiers[i].upTo - kwh),
      };
    }
  }
  return {
    currentStage: tiers.length,
    nextStage: null as number | null,
    threshold: null as number | null,
    remaining: 0,
  };
}

/* ────────────────────────────────────────────────────────────────────────
 * 에어컨 프리셋 — 시간당 예상 소비량(kWh/h)은 인버터 저전력 운전을 감안한
 * '실사용 평균' 추정치입니다. 정속형은 더 높게 잡았습니다.
 * ──────────────────────────────────────────────────────────────────────── */
type Preset = { id: string; label: string; kwhPerHour: number };
const AC_PRESETS: Preset[] = [
  { id: "wall-small", label: "벽걸이 · 소형 (~7평, 인버터)", kwhPerHour: 0.5 },
  { id: "wall-mid", label: "벽걸이 · 중형 (~9평, 인버터)", kwhPerHour: 0.7 },
  { id: "stand-15", label: "스탠드 · 15평형 (인버터)", kwhPerHour: 1.0 },
  { id: "stand-18", label: "스탠드 · 18평형 (인버터)", kwhPerHour: 1.2 },
  { id: "stand-23", label: "스탠드 · 23평형 (인버터)", kwhPerHour: 1.5 },
  { id: "fixed-old", label: "구형 정속형 (대형)", kwhPerHour: 1.8 },
];

/** 검침 시작일 기준 이번 청구주기의 일수 / 경과일 계산 */
function billingCycle(today: Date, startDay: number) {
  const start = new Date(today.getFullYear(), today.getMonth(), startDay);
  if (today.getDate() < startDay) start.setMonth(start.getMonth() - 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, startDay);
  const MS_DAY = 86_400_000;
  const totalDays = Math.round((end.getTime() - start.getTime()) / MS_DAY);
  const rawElapsed =
    Math.floor((today.getTime() - start.getTime()) / MS_DAY) + 1; // 오늘 포함
  const elapsedDays = Math.min(Math.max(rawElapsed, 1), totalDays);
  return { start, end, totalDays, elapsedDays };
}

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const kwh = (n: number) => `${n.toFixed(1)}kWh`;

/* ────────────────────────── 설정(로컬 저장) ────────────────────────── */
type Settings = {
  presetId: string;
  hoursPerDay: number;
  baselineKwh: number; // 에어컨 제외 평상시 한 달 사용량
  startDay: number; // 검침 시작일
  measuredKwh: string; // 실측 보정(지금까지 실제 총 사용량). 빈 문자열=미사용
};
const DEFAULTS: Settings = {
  presetId: "stand-15",
  hoursPerDay: 8,
  baselineKwh: 250,
  startDay: 1,
  measuredKwh: "",
};
const STORAGE_KEY = "aircon-fee-sim/v1";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* 저장소 접근 불가 시 기본값 */
  }
  return DEFAULTS;
}

function App() {
  const [s, setS] = useState<Settings>(loadSettings);
  const [now, setNow] = useState(() => new Date());

  // 날짜가 바뀌면 '오늘까지' 계산이 자동 갱신되도록 1분마다 시계 갱신
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* 무시 */
    }
  }, [s]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setS((prev) => ({ ...prev, [key]: value }));

  const r = useMemo(() => {
    const month = now.getMonth() + 1;
    const tiers = tiersForMonth(month);
    const cycle = billingCycle(now, s.startDay);
    const preset = AC_PRESETS.find((p) => p.id === s.presetId) ?? AC_PRESETS[2];

    const acDailyKwh = preset.kwhPerHour * s.hoursPerDay;
    const baselineDaily = s.baselineKwh / cycle.totalDays;

    // 지금까지 누적 (자동 추정)
    const estSoFar = (acDailyKwh + baselineDaily) * cycle.elapsedDays;
    // 실측 보정값이 있으면 그것을 '지금까지 총 사용량'으로 사용
    const measured = parseFloat(s.measuredKwh);
    const hasMeasured = !isNaN(measured) && measured >= 0;
    const totalSoFar = hasMeasured ? measured : estSoFar;

    // 남은 일수만큼 (에어컨 + 평상시) 연장 → 월말 예상
    const remainDays = cycle.totalDays - cycle.elapsedDays;
    const projectedMonth =
      totalSoFar + (acDailyKwh + baselineDaily) * remainDays;

    const bill = calcBill(projectedMonth, tiers);
    const baselineOnlyBill = calcBill(s.baselineKwh, tiers); // 에어컨이 없었다면
    const acExtra = Math.max(0, bill.total - baselineOnlyBill.total);

    const nt = nextTierInfo(totalSoFar, tiers); // 현재 누적 기준(2단계까지 남은 kWh)
    const projStage = nextTierInfo(projectedMonth, tiers).currentStage; // 월말 예상 단계
    const acDaysAccum = acDailyKwh * cycle.elapsedDays;

    // 누진 구간 진행 막대 (현재 누적 vs 3단계 진입선)
    const topThreshold = tiers[1].upTo; // 마지막 경계(=3단계 진입선)
    const barPct = Math.min(100, (totalSoFar / topThreshold) * 100);

    return {
      month,
      isSummer: month === 7 || month === 8,
      cycle,
      preset,
      acDailyKwh,
      acDaysAccum,
      totalSoFar,
      projectedMonth,
      bill,
      acExtra,
      nt,
      projStage,
      barPct,
      tiers,
      hasMeasured,
    };
  }, [s, now]);

  const stageClass =
    r.nt.currentStage >= 3 ? "danger" : r.nt.currentStage === 2 ? "warn" : "ok";
  const projClass =
    r.projStage >= 3 ? "danger" : r.projStage === 2 ? "warn" : "ok";

  return (
    <div className="app">
      <header className="hero">
        <p className="hero-eyebrow">
          {r.month}월 {r.isSummer ? "· 여름 누진구간 확대 적용" : ""}
        </p>
        <h1 className="hero-title">이번 달 예상 전기요금</h1>
        <p className={`hero-amount ${projClass}`}>{won(r.bill.total)}</p>
        <p className="hero-sub">
          오늘까지 <b>{r.cycle.elapsedDays}일째</b> · 에어컨 하루{" "}
          <b>{s.hoursPerDay}시간</b> 기준
        </p>
        <p className="hero-proj">
          이대로 가면 월말 <b className={projClass}>누진 {r.projStage}단계</b> ·{" "}
          {kwh(r.projectedMonth)}
        </p>
        <div className="hero-extra">
          🔥 에어컨 때문에 <b>+{won(r.acExtra)}</b>
        </div>
      </header>

      {/* 누진 단계 현황 */}
      <section className={`card stage-card ${stageClass}`}>
        <div className="stage-top">
          <span className={`badge ${stageClass}`}>
            현재 누진 {r.nt.currentStage}단계
          </span>
          <span className="stage-kwh">
            누적 {kwh(r.totalSoFar)}
            {r.hasMeasured ? " · 실측" : " · 추정"}
          </span>
        </div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${r.barPct}%` }} />
          <span
            className="bar-mark"
            style={{ left: `${(r.tiers[0].upTo / r.tiers[1].upTo) * 100}%` }}
          />
        </div>
        <div className="bar-legend">
          <span>1단계</span>
          <span>2단계 ({r.tiers[0].upTo}kWh)</span>
          <span>3단계 ({r.tiers[1].upTo}kWh)</span>
        </div>
        {r.nt.nextStage ? (
          <p className="stage-msg">
            누진 <b>{r.nt.nextStage}단계</b> 진입까지{" "}
            <b className={stageClass}>{kwh(r.nt.remaining)}</b> 남았어요
          </p>
        ) : (
          <p className="stage-msg danger">
            이미 최고 누진 단계예요. 사용을 줄이면 요금이 크게 내려가요.
          </p>
        )}
      </section>

      {/* 예상 상세 */}
      <section className="card">
        <h2 className="card-title">예상 상세</h2>
        <Row label="월말 예상 사용량" value={kwh(r.projectedMonth)} />
        <Row label="지금까지 에어컨 사용량" value={kwh(r.acDaysAccum)} />
        <Row label="에어컨 하루 사용량" value={kwh(r.acDailyKwh)} />
        <Row label="이번 청구주기" value={`${r.cycle.totalDays}일`} />
      </section>

      {/* 입력 */}
      <section className="card">
        <h2 className="card-title">내 정보 입력</h2>

        <label className="field">
          <span className="field-label">에어컨 종류</span>
          <select
            className="input"
            value={s.presetId}
            onChange={(e) => set("presetId", e.target.value)}
          >
            {AC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field-label">하루 평균 사용시간</span>
          <Stepper
            value={s.hoursPerDay}
            min={0}
            max={24}
            step={1}
            suffix="시간"
            onChange={(v) => set("hoursPerDay", v)}
          />
        </div>

        <label className="field">
          <span className="field-label">
            지난달 사용량 (kWh){" "}
            <em className="hint">에어컨 거의 안 쓴 달이 정확해요</em>
          </span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            value={s.baselineKwh}
            onChange={(e) => set("baselineKwh", Number(e.target.value) || 0)}
          />
        </label>

        <label className="field">
          <span className="field-label">
            검침 시작일 <em className="hint">고지서의 검침 시작일 (1~28)</em>
          </span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={1}
            max={28}
            value={s.startDay}
            onChange={(e) =>
              set(
                "startDay",
                Math.min(28, Math.max(1, Number(e.target.value) || 1)),
              )
            }
          />
        </label>

        <details className="advanced">
          <summary>실측 보정 (선택)</summary>
          <label className="field">
            <span className="field-label">
              지금까지 실제 사용량 (kWh){" "}
              <em className="hint">
                한전/고지서 검침값을 넣으면 이 값으로 계산해요
              </em>
            </span>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="비워두면 자동 추정"
              value={s.measuredKwh}
              onChange={(e) => set("measuredKwh", e.target.value)}
            />
          </label>
        </details>

        <button className="reset" onClick={() => setS(DEFAULTS)}>
          기본값으로 초기화
        </button>
      </section>

      <p className="disclaimer">
        요금은 {RATE_AS_OF} 누진표로 계산한 <b>예상치</b>이며, 실제 청구액과
        다를 수 있어요. 인버터 에어컨은 실사용 평균 소비량으로 추정합니다.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <span className="row-label">{label}</span>
      <span className="row-value">{value}</span>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <div className="stepper">
      <button
        className="stepper-btn"
        onClick={() => onChange(clamp(value - step))}
        aria-label="감소"
      >
        −
      </button>
      <span className="stepper-value">
        {value}
        {suffix ? <em>{suffix}</em> : null}
      </span>
      <button
        className="stepper-btn"
        onClick={() => onChange(clamp(value + step))}
        aria-label="증가"
      >
        +
      </button>
    </div>
  );
}

export default App;
