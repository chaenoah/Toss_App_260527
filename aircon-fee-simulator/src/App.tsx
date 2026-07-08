import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

/* ────────────────────────────────────────────────────────────────────────
 * 한전 주택용 전력(저압) 요금표
 * 누진 단가/기본요금: 2023-05-16 시행표 (2025년 현재 유효) — 출처 KEPCO
 * 전력산업기반기금: 2025-07-01부터 2.7% (3.7% → 3.2% → 2.7% 단계 인하)
 * ⚠️ 요율은 개정될 수 있어요. 출시 전 한전 공식 요금표로 아래 상수를 확인하세요.
 * ──────────────────────────────────────────────────────────────────────── */
const RATE_AS_OF = "2025년 주택용 저압 기준";
const CLIMATE_CHARGE = 9.0; // 기후환경요금 (원/kWh)
const FUEL_CHARGE = 5.0; // 연료비조정요금 (원/kWh)
const VAT_RATE = 0.1; // 부가가치세
const FUND_RATE = 0.027; // 전력산업기반기금 (2025.7~)

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
function calcBill(usageKwh: number, tiers: Tier[]) {
  const usage = Math.max(0, usageKwh);
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
function nextTierInfo(usageKwh: number, tiers: Tier[]) {
  for (let i = 0; i < tiers.length - 1; i++) {
    if (usageKwh <= tiers[i].upTo) {
      return {
        currentStage: i + 1,
        nextStage: i + 2,
        threshold: tiers[i].upTo,
        remaining: Math.max(0, tiers[i].upTo - usageKwh),
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

/** 누진 단계별 사용량·요금 분해 (리포트용) */
function tierBreakdown(usageKwh: number, tiers: Tier[]) {
  const usage = Math.max(0, usageKwh);
  let prev = 0;
  const out: { stage: number; kwh: number; amount: number }[] = [];
  tiers.forEach((t, i) => {
    if (usage > prev) {
      const inTier = Math.min(usage, t.upTo) - prev;
      out.push({ stage: i + 1, kwh: inTier, amount: inTier * t.price });
      prev = t.upTo;
    }
  });
  return out;
}

// 가구 월 사용량 평균(참고용 추정치) — 리포트의 '평균 대비' 비교에 사용
const AVG_KWH = { summer: 350, normal: 280 };

/* 리워드형 광고 그룹 ID — 앱인토스 콘솔에서 발급한 '리워드형' 광고 그룹 ID로 교체하세요.
 * ⚠️ 테스트 중에는 반드시 '테스트용' 광고 ID를 사용하세요. 운영 ID로 테스트하면 제재 대상이에요. */
const REWARDED_AD_GROUP_ID = "<REWARDED_AD_GROUP_ID>";

/* ────────────────────────────────────────────────────────────────────────
 * 에어컨 소비량 추정
 * 프리셋의 kWh/h, 그리고 직접입력(냉방면적×타입)의 계수는 인버터 저전력 운전을
 * 감안한 '실사용 평균' 추정치입니다.
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
// 냉방면적(평)당 시간당 소비량 추정 계수
const PYEONG_FACTOR = { inverter: 0.066, fixed: 0.1 } as const;

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
const kwhStr = (n: number) => `${n.toFixed(1)}kWh`;

/* ────────────────────────── 설정(로컬 저장) ────────────────────────── */
type Settings = {
  onboarded: boolean; // 첫 실행 온보딩 완료 여부
  specMode: "preset" | "custom";
  presetId: string;
  areaPyeong: number; // 직접입력: 냉방면적(평)
  acType: "inverter" | "fixed"; // 직접입력: 에어컨 타입
  hoursPerDay: number;
  baselineKwh: number; // 에어컨 제외 평상시 한 달 사용량
  startDay: number; // 검침 시작일
  measuredKwh: string; // 실측 보정(지금까지 실제 총 사용량). 빈 문자열=미사용
};
const DEFAULTS: Settings = {
  onboarded: false,
  specMode: "preset",
  presetId: "stand-15",
  areaPyeong: 15,
  acType: "inverter",
  hoursPerDay: 8,
  baselineKwh: 250,
  startDay: 1,
  measuredKwh: "",
};
const STORAGE_KEY = "aircon-fee-sim/v2";

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
  const [reportUnlocked, setReportUnlocked] = useState(false);
  const [adShowing, setAdShowing] = useState(false);

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

  // 리워드 광고 미리 불러오기 (토스 앱 등 지원 환경에서만)
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    (async () => {
      try {
        const { GoogleAdMob } = await import("@apps-in-toss/web-framework");
        if (GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.() !== true) return;
        cleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: { adGroupId: REWARDED_AD_GROUP_ID },
          onEvent: () => {},
          onError: () => {},
        });
      } catch {
        /* 미지원 환경 */
      }
    })();
    return () => cleanup?.();
  }, []);

  // 리워드 광고 노출 → 시청 완료 시 맞춤 리포트 잠금 해제
  const showRewardedAd = useCallback(() => {
    setAdShowing(true);
    (async () => {
      try {
        const { GoogleAdMob } = await import("@apps-in-toss/web-framework");
        if (GoogleAdMob?.showAppsInTossAdMob?.isSupported?.() !== true) {
          throw new Error("unsupported");
        }
        let earned = false;
        GoogleAdMob.showAppsInTossAdMob({
          options: { adGroupId: REWARDED_AD_GROUP_ID },
          onEvent: (e) => {
            if (e.type === "userEarnedReward") earned = true;
            if (e.type === "dismissed") {
              setAdShowing(false);
              if (earned) setReportUnlocked(true);
            }
            if (e.type === "failedToShow") setAdShowing(false);
          },
          onError: () => setAdShowing(false),
        });
      } catch {
        // 토스 앱 밖(브라우저)·미지원 환경: 광고 시청을 시뮬레이션한 뒤 보상 지급
        setTimeout(() => {
          setAdShowing(false);
          setReportUnlocked(true);
        }, 1500);
      }
    })();
  }, []);

  const r = useMemo(() => {
    const month = now.getMonth() + 1;
    const tiers = tiersForMonth(month);
    const cycle = billingCycle(now, s.startDay);

    const kwhPerHour =
      s.specMode === "custom"
        ? Math.max(0.2, s.areaPyeong * PYEONG_FACTOR[s.acType])
        : (AC_PRESETS.find((p) => p.id === s.presetId) ?? AC_PRESETS[2])
            .kwhPerHour;

    const acDailyKwh = kwhPerHour * s.hoursPerDay;
    const baselineDaily = s.baselineKwh / cycle.totalDays;
    const dailyTotal = acDailyKwh + baselineDaily;

    // 지금까지 누적 (자동 추정) — 실측 보정값이 있으면 그 값 사용
    const estSoFar = dailyTotal * cycle.elapsedDays;
    const measured = parseFloat(s.measuredKwh);
    const hasMeasured = !isNaN(measured) && measured >= 0;
    const totalSoFar = hasMeasured ? measured : estSoFar;

    // 남은 일수만큼 연장 → 월말 예상
    const remainDays = cycle.totalDays - cycle.elapsedDays;
    const projectedMonth = totalSoFar + dailyTotal * remainDays;

    const bill = calcBill(projectedMonth, tiers);
    const baselineOnlyBill = calcBill(s.baselineKwh, tiers); // 에어컨이 없었다면
    const acExtra = Math.max(0, bill.total - baselineOnlyBill.total);

    const nt = nextTierInfo(totalSoFar, tiers); // 현재 누적 기준
    const projStage = nextTierInfo(projectedMonth, tiers).currentStage; // 월말 예상 단계
    const acDaysAccum = acDailyKwh * cycle.elapsedDays;

    // 절약 시뮬레이션 (추정 사용 기준 — 습관을 바꾸면 얼마나 아끼나)
    const estMonth = s.baselineKwh + acDailyKwh * cycle.totalDays;
    const estTotal = calcBill(estMonth, tiers).total;
    const billIf = (acDaily: number) =>
      calcBill(s.baselineKwh + acDaily * cycle.totalDays, tiers).total;
    const saveHour = Math.max(
      0,
      estTotal - billIf(kwhPerHour * Math.max(0, s.hoursPerDay - 1)),
    );
    const saveTemp = Math.max(0, estTotal - billIf(acDailyKwh * 0.93)); // 설정온도 1℃↑ ≈ 냉방 7%↓
    const saveTwoHour = Math.max(
      0,
      estTotal - billIf(kwhPerHour * Math.max(0, s.hoursPerDay - 2)),
    );

    // 맞춤 절약 리포트 (리워드 광고 보상)
    const avgKwh = month === 7 || month === 8 ? AVG_KWH.summer : AVG_KWH.normal;
    const avgBill = calcBill(avgKwh, tiers).total;
    const diffPct = Math.round((bill.total / avgBill - 1) * 100);
    const breakdown = tierBreakdown(projectedMonth, tiers);
    const best =
      saveTwoHour >= saveHour && saveTwoHour >= saveTemp
        ? { label: "하루 2시간 덜 틀기", amount: saveTwoHour }
        : saveHour >= saveTemp
          ? { label: "하루 1시간 덜 틀기", amount: saveHour }
          : { label: "설정온도 1℃ 올리기", amount: saveTemp };
    const tier2Hours =
      kwhPerHour > 0
        ? Math.max(
            0,
            Math.floor(
              (tiers[0].upTo - s.baselineKwh) / (kwhPerHour * cycle.totalDays),
            ),
          )
        : 0;

    return {
      month,
      isSummer: month === 7 || month === 8,
      cycle,
      kwhPerHour,
      acDailyKwh,
      dailyTotal,
      acDaysAccum,
      totalSoFar,
      projectedMonth,
      bill,
      acExtra,
      nt,
      projStage,
      tiers,
      t2: tiers[0].upTo,
      t3: tiers[1].upTo,
      hasMeasured,
      saveHour,
      saveTwoHour,
      saveTemp,
      avgBill,
      diffPct,
      breakdown,
      best,
      tier2Hours,
    };
  }, [s, now]);

  const stageClass = classFor(r.nt.currentStage);
  const projClass = classFor(r.projStage);

  const onShare = async () => {
    const message =
      `🌡️ 우리집 이번 달 예상 전기요금 ${won(r.bill.total)}\n` +
      `에어컨 때문에 +${won(r.acExtra)} 😱 (이대로면 누진 ${r.projStage}단계)\n\n` +
      `#에어컨요금시뮬레이터`;
    try {
      const mod = await import("@apps-in-toss/web-framework");
      let text = message;
      try {
        const link = await mod.getTossShareLink("intoss://airconbill");
        text = `${message}\n${link}`;
      } catch {
        /* 링크 생성 불가 시 텍스트만 공유 */
      }
      await mod.share({ message: text });
    } catch {
      // 토스 앱 밖(브라우저)에서는 웹 공유/클립보드로 폴백
      if (navigator.share) {
        try {
          await navigator.share({ text: message });
          return;
        } catch {
          /* 사용자 취소 등 */
        }
      }
      try {
        await navigator.clipboard.writeText(message);
        alert("공유 문구를 복사했어요!");
      } catch {
        alert(message);
      }
    }
  };

  if (!s.onboarded) {
    return <Onboarding s={s} set={set} onDone={() => set("onboarded", true)} />;
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="hero-eyebrow">
          {r.month}월{r.isSummer ? " · 여름 누진구간 확대 적용" : ""}
        </p>
        <h1 className="hero-title">이번 달 예상 전기요금</h1>
        <p className={`hero-amount ${projClass}`}>{won(r.bill.total)}</p>
        <p className="hero-sub">
          오늘까지 <b>{r.cycle.elapsedDays}일째</b> · 에어컨 하루{" "}
          <b>{s.hoursPerDay}시간</b> 기준
        </p>
        <p className="hero-proj">
          이대로 가면 월말 <b className={projClass}>누진 {r.projStage}단계</b> ·{" "}
          {kwhStr(r.projectedMonth)}
        </p>
        <div className="hero-extra">
          🔥 에어컨 때문에 <b>+{won(r.acExtra)}</b>
        </div>
      </header>

      <button className="share-btn" onClick={onShare}>
        📤 예상 요금 공유하기
      </button>

      {/* 누진 단계 현황 */}
      <section className={`card stage-card ${stageClass}`}>
        <div className="stage-top">
          <span className={`badge ${stageClass}`}>
            현재 누진 {r.nt.currentStage}단계
          </span>
          <span className="stage-kwh">
            누적 {kwhStr(r.totalSoFar)}
            {r.hasMeasured ? " · 실측" : " · 추정"}
          </span>
        </div>
        {r.nt.nextStage ? (
          <p className="stage-msg">
            누진 <b>{r.nt.nextStage}단계</b> 진입까지{" "}
            <b className={stageClass}>{kwhStr(r.nt.remaining)}</b> 남았어요
          </p>
        ) : (
          <p className="stage-msg danger">
            이미 최고 누진 단계예요. 사용을 줄이면 요금이 크게 내려가요.
          </p>
        )}
      </section>

      {/* 일별 누적 사용량 그래프 */}
      <section className="card">
        <h2 className="card-title">이번 달 사용량 추이</h2>
        <UsageChart
          elapsedDays={r.cycle.elapsedDays}
          totalDays={r.cycle.totalDays}
          totalSoFar={r.totalSoFar}
          projectedMonth={r.projectedMonth}
          dailyTotal={r.dailyTotal}
          t2={r.t2}
          t3={r.t3}
        />
        <p className="chart-caption">
          파란 실선 = 오늘까지, 점선 = 월말 예상. 가로선은 누진 2·3단계
          진입선이에요.
        </p>
      </section>

      {/* 절약 시뮬레이션 */}
      <section className="card savings-card">
        <h2 className="card-title">이렇게 하면 아껴요 💰</h2>
        <SaveRow icon="⏱️" label="하루 1시간 덜 틀기" save={r.saveHour} />
        <SaveRow icon="⏱️" label="하루 2시간 덜 틀기" save={r.saveTwoHour} />
        <SaveRow icon="🌡️" label="설정온도 1℃ 올리기" save={r.saveTemp} />
        <p className="savings-note">
          예상 사용량 기준으로 이번 달 아낄 수 있는 금액이에요.
        </p>
      </section>

      {/* 맞춤 절약 리포트 (리워드 광고 보상) */}
      <ReportCard
        unlocked={reportUnlocked}
        showing={adShowing}
        onWatch={showRewardedAd}
        billTotal={r.bill.total}
        avgBill={r.avgBill}
        diffPct={r.diffPct}
        breakdown={r.breakdown}
        best={r.best}
        tier2Hours={r.tier2Hours}
      />

      {/* 예상 상세 */}
      <section className="card">
        <h2 className="card-title">예상 상세</h2>
        <Row label="월말 예상 사용량" value={kwhStr(r.projectedMonth)} />
        <Row label="지금까지 에어컨 사용량" value={kwhStr(r.acDaysAccum)} />
        <Row label="에어컨 하루 사용량" value={kwhStr(r.acDailyKwh)} />
        <Row label="이번 청구주기" value={`${r.cycle.totalDays}일`} />
      </section>

      {/* 입력 */}
      <section className="card">
        <h2 className="card-title">내 정보 입력</h2>

        <div className="field">
          <span className="field-label">에어컨 정보</span>
          <div className="segment">
            <button
              className={s.specMode === "preset" ? "on" : ""}
              onClick={() => set("specMode", "preset")}
            >
              프리셋
            </button>
            <button
              className={s.specMode === "custom" ? "on" : ""}
              onClick={() => set("specMode", "custom")}
            >
              직접 입력
            </button>
          </div>
        </div>

        {s.specMode === "preset" ? (
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
        ) : (
          <>
            <label className="field">
              <span className="field-label">냉방면적 (평)</span>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={3}
                max={60}
                value={s.areaPyeong}
                onChange={(e) =>
                  set("areaPyeong", Math.max(0, Number(e.target.value) || 0))
                }
              />
            </label>
            <div className="field">
              <span className="field-label">에어컨 타입</span>
              <div className="segment">
                <button
                  className={s.acType === "inverter" ? "on" : ""}
                  onClick={() => set("acType", "inverter")}
                >
                  인버터
                </button>
                <button
                  className={s.acType === "fixed" ? "on" : ""}
                  onClick={() => set("acType", "fixed")}
                >
                  정속형
                </button>
              </div>
            </div>
            <p className="est-note">
              추정 소비량 <b>{r.kwhPerHour.toFixed(2)}kWh/시간</b>
            </p>
          </>
        )}

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

        <button
          className="reset"
          onClick={() => setS({ ...DEFAULTS, onboarded: true })}
        >
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

function classFor(stage: number) {
  return stage >= 3 ? "danger" : stage === 2 ? "warn" : "ok";
}

function Onboarding({
  s,
  set,
  onDone,
}: {
  s: Settings;
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onDone: () => void;
}) {
  return (
    <div className="app onboarding">
      <div className="onb-hero">
        <div className="onb-emoji">🌡️❄️</div>
        <h1 className="onb-title">{"우리집 에어컨 요금,\n미리 확인해요"}</h1>
        <p className="onb-sub">
          3가지만 입력하면 이번 달 예상 전기요금과 누진 단계를 알려드려요.
        </p>
      </div>

      <div className="card">
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

        <label className="field last">
          <span className="field-label">
            지난달 사용량 (kWh){" "}
            <em className="hint">고지서 참고 · 몰라도 대략</em>
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
      </div>

      <button className="onb-cta" onClick={onDone}>
        내 예상 요금 보기
      </button>
      <button className="onb-skip" onClick={onDone}>
        나중에 설정할게요
      </button>
    </div>
  );
}

function SaveRow({
  icon,
  label,
  save,
}: {
  icon: string;
  label: string;
  save: number;
}) {
  return (
    <div className="save-row">
      <span className="save-label">
        <span className="save-icon">{icon}</span>
        {label}
      </span>
      <span className="save-amount">{save > 0 ? `−${won(save)}` : "-"}</span>
    </div>
  );
}

function ReportCard({
  unlocked,
  showing,
  onWatch,
  billTotal,
  avgBill,
  diffPct,
  breakdown,
  best,
  tier2Hours,
}: {
  unlocked: boolean;
  showing: boolean;
  onWatch: () => void;
  billTotal: number;
  avgBill: number;
  diffPct: number;
  breakdown: { stage: number; kwh: number; amount: number }[];
  best: { label: string; amount: number };
  tier2Hours: number;
}) {
  const above = diffPct >= 0;
  const diffText = above
    ? `${diffPct}% 높아요`
    : `${Math.abs(diffPct)}% 낮아요`;

  if (!unlocked) {
    return (
      <section className="card report-card locked">
        <h2 className="card-title">맞춤 절약 리포트 🔒</h2>
        <p className="report-teaser">
          우리집 요금은 평균보다{" "}
          <b className={above ? "danger" : "ok"}>{diffText}</b>. 평균 비교 ·
          단계별 요금 구성 · 맞춤 절약 액션을 확인해보세요.
        </p>
        <button className="reward-btn" onClick={onWatch} disabled={showing}>
          {showing ? "광고 준비 중…" : "📺 광고 보고 무료로 열기"}
        </button>
        <p className="reward-note">광고를 끝까지 보면 리포트가 열려요.</p>
      </section>
    );
  }

  const maxAmt = Math.max(...breakdown.map((b) => b.amount), 1);
  return (
    <section className="card report-card">
      <h2 className="card-title">맞춤 절약 리포트 ✨</h2>

      <div className="report-block">
        <p className="report-h">여름철 4인 가구 평균 대비</p>
        <p className="report-compare">
          평균 {won(avgBill)} → 우리집{" "}
          <b className={above ? "danger" : "ok"}>{won(billTotal)}</b>
          <span className={`report-pill ${above ? "danger" : "ok"}`}>
            {above ? `+${diffPct}%` : `${diffPct}%`}
          </span>
        </p>
      </div>

      <div className="report-block">
        <p className="report-h">누진 단계별 요금 구성</p>
        {breakdown.map((b) => (
          <div className="brk-row" key={b.stage}>
            <span className="brk-label">
              {b.stage}단계 · {b.kwh.toFixed(0)}kWh
            </span>
            <div className="brk-bar">
              <div
                className={`brk-fill s${b.stage}`}
                style={{ width: `${(b.amount / maxAmt) * 100}%` }}
              />
            </div>
            <span className="brk-amt">{won(b.amount)}</span>
          </div>
        ))}
      </div>

      <div className="report-block last">
        <p className="report-h">지금 가장 효과적인 절약</p>
        <p className="report-best">
          🏆 {best.label} <b>−{won(best.amount)}</b>
        </p>
        {tier2Hours > 0 && (
          <p className="report-tip">
            💡 하루 <b>{tier2Hours}시간</b> 이하로 쓰면 누진 2단계를 유지할 수
            있어요.
          </p>
        )}
      </div>
    </section>
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

/* 일별 누적 사용량 면적 차트 (단일 시리즈 + 누진 경계선) */
function UsageChart({
  elapsedDays,
  totalDays,
  totalSoFar,
  projectedMonth,
  dailyTotal,
  t2,
  t3,
}: {
  elapsedDays: number;
  totalDays: number;
  totalSoFar: number;
  projectedMonth: number;
  dailyTotal: number;
  t2: number;
  t3: number;
}) {
  const W = 340;
  const H = 200;
  const ML = 8;
  const MR = 52;
  const MT = 16;
  const MB = 26;
  const PW = W - ML - MR;
  const PH = H - MT - MB;
  const yMax = Math.max(projectedMonth, t3) * 1.12;

  const xOf = (day: number) => ML + (day / totalDays) * PW;
  const yOf = (v: number) => MT + PH - (v / yMax) * PH;
  const baseY = yOf(0);

  // 누진 단계 진입일 (piecewise: 0→오늘 실선, 오늘→월말 점선)
  const crossDay = (T: number): number | null => {
    if (T <= 0) return 0;
    if (T <= totalSoFar) {
      return totalSoFar > 0 ? (T / totalSoFar) * elapsedDays : null;
    }
    if (T <= projectedMonth && dailyTotal > 0) {
      return elapsedDays + (T - totalSoFar) / dailyTotal;
    }
    return null;
  };

  const solid = `M ${xOf(0)} ${yOf(0)} L ${xOf(elapsedDays)} ${yOf(totalSoFar)}`;
  const area =
    `M ${xOf(0)} ${baseY} L ${xOf(0)} ${yOf(0)} ` +
    `L ${xOf(elapsedDays)} ${yOf(totalSoFar)} L ${xOf(elapsedDays)} ${baseY} Z`;
  const dashed =
    `M ${xOf(elapsedDays)} ${yOf(totalSoFar)} ` +
    `L ${xOf(totalDays)} ${yOf(projectedMonth)}`;

  const tierLine = (T: number, cls: string, label: string) => {
    const y = yOf(T);
    const cd = crossDay(T);
    return (
      <g key={label}>
        <line
          className={`tier-line ${cls}`}
          x1={ML}
          y1={y}
          x2={ML + PW}
          y2={y}
        />
        <text className={`tier-label ${cls}`} x={ML + PW + 6} y={y - 3}>
          {label}
        </text>
        <text className="tier-sub" x={ML + PW + 6} y={y + 10}>
          {T}kWh
        </text>
        {cd != null && cd >= 0 && cd <= totalDays && (
          <>
            <circle
              className={`cross-dot ${cls}`}
              cx={xOf(cd)}
              cy={y}
              r={3.5}
            />
            <text className={`cross-label ${cls}`} x={xOf(cd)} y={y - 7}>
              {Math.ceil(cd)}일
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img">
      <path className="area-fill" d={area} />
      {tierLine(t3, "danger", "3단계")}
      {tierLine(t2, "warn", "2단계")}
      <path className="line-solid" d={solid} />
      <path className="line-dashed" d={dashed} />
      <circle
        className="today-dot"
        cx={xOf(elapsedDays)}
        cy={yOf(totalSoFar)}
        r={4.5}
      />
      <text
        className="today-label"
        x={xOf(elapsedDays)}
        y={yOf(totalSoFar) - 9}
      >
        오늘
      </text>
      <text className="axis-label" x={ML} y={H - 8}>
        1일
      </text>
      <text className="axis-label end" x={ML + PW} y={H - 8}>
        {totalDays}일
      </text>
    </svg>
  );
}

export default App;
