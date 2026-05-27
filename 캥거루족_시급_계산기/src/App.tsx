import { useState, useEffect } from "react";
import "./App.css";

// ── Types ────────────────────────────────────────────
type Screen = "intro" | "input" | "result";
type Cleaning = "me" | "half" | "parents";
type Rent = 50 | 70 | 100 | 150;

interface Inputs {
  meals: number;
  laundry: number;
  cleaning: Cleaning;
  rent: Rent;
}

interface Result {
  total: number;
  mealCost: number;
  laundryCost: number;
  cleaningCost: number;
  rentCost: number;
  hourlyWage: number;
}

// ── Constants ────────────────────────────────────────
const MEAL_PRICE = 10_000;
const LAUNDRY_PRICE = 12_000;
const CLEANING_PRICE: Record<Cleaning, number> = { me: 0, half: 25_000, parents: 50_000 };
const CLEANING_HOURS: Record<Cleaning, number> = { me: 0, half: 4, parents: 8 };
const CLEANING_LABEL: Record<Cleaning, string> = { me: "직접 청소", half: "반반씩", parents: "부모님 전담" };

// ── Helpers ──────────────────────────────────────────
function calculate(i: Inputs): Result {
  const mealCost = i.meals * MEAL_PRICE;
  const laundryCost = i.laundry * LAUNDRY_PRICE;
  const cleaningCost = CLEANING_PRICE[i.cleaning];
  const rentCost = i.rent * 10_000;
  const total = mealCost + laundryCost + cleaningCost + rentCost;
  const laborHours = i.meals * 0.5 + i.laundry * 0.5 + CLEANING_HOURS[i.cleaning];
  const laborCost = mealCost + laundryCost + cleaningCost;
  const hourlyWage = laborHours > 0 ? Math.round(laborCost / laborHours) : 0;
  return { total, mealCost, laundryCost, cleaningCost, rentCost, hourlyWage };
}

function getRank(w: number) {
  if (w < 5_000)  return { rank: "수습 인턴",      emoji: "🐣", comment: "아직 양심이 살아있네요\n근데 언제까지 그럴 것 같아요?" };
  if (w < 8_000)  return { rank: "신입사원급",      emoji: "👔", comment: "출발은 나쁘지 않은데...\n시작이 반이라더니" };
  if (w < 12_000) return { rank: "대기업 대리급",   emoji: "💼", comment: "엄마가 직원이에요?\n근무 계약서 어딨나요" };
  if (w < 18_000) return { rank: "대기업 과장급",   emoji: "🔥", comment: "이 정도면 착취예요\n진심으로" };
  if (w < 25_000) return { rank: "대기업 부장급",   emoji: "👑", comment: "부모님이 퇴직 신청\n준비 중이신 거 아세요?" };
  return           { rank: "임원급 이상",           emoji: "🚀", comment: "법적으로 문제없는지\n한번 확인해보세요 아니 진짜로" };
}

function getPercentile(total: number) {
  if (total < 500_000)   return 70;
  if (total < 800_000)   return 50;
  if (total < 1_200_000) return 30;
  if (total < 1_600_000) return 15;
  return 5;
}

const fmt = (n: number) => n.toLocaleString("ko-KR");

function useCountUp(target: number, ms = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    setVal(0);
    if (!target) return;
    const step = target / (ms / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.round(cur));
      if (cur >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, ms]);
  return val;
}

// ── App ──────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [inputs, setInputs] = useState<Inputs>({ meals: 45, laundry: 8, cleaning: "half", rent: 70 });
  const [result, setResult] = useState<Result | null>(null);

  function handleCalculate() {
    setResult(calculate(inputs));
    setScreen("result");
  }

  return (
    <div className="app">
      {screen === "intro" && <IntroScreen onStart={() => setScreen("input")} />}
      {screen === "input" && (
        <InputScreen inputs={inputs} onChange={setInputs} onCalculate={handleCalculate} onBack={() => setScreen("intro")} />
      )}
      {screen === "result" && result && (
        <ResultScreen inputs={inputs} result={result} onRetry={() => setScreen("input")} />
      )}
    </div>
  );
}

// ── Intro Screen ─────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="screen intro">
      <span className="intro-emoji">🦘</span>
      <h1 className="intro-title">캥거루족<br /><span>시급</span> 계산기</h1>
      <p className="intro-subtitle">이번 달 부모님 등골<br />얼마나 빼먹었는지 확인해봐요</p>
      <button className="btn-primary" onClick={onStart}>내 착취력 계산하기 →</button>
      <p className="intro-disclaimer">※ 결과는 시장 평균 기준이며 재미를 위한 용도입니다</p>
    </div>
  );
}

// ── Input Screen ─────────────────────────────────────
interface InputScreenProps {
  inputs: Inputs;
  onChange: (i: Inputs) => void;
  onCalculate: () => void;
  onBack: () => void;
}

function InputScreen({ inputs, onChange, onCalculate, onBack }: InputScreenProps) {
  function set<K extends keyof Inputs>(k: K, v: Inputs[K]) {
    onChange({ ...inputs, [k]: v });
  }

  return (
    <div className="screen">
      <div className="input-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="input-header-title">착취 내역 입력</span>
      </div>

      <div className="input-body">
        {/* 집밥 */}
        <div className="card">
          <div className="card-header">
            <span className="card-emoji">🍚</span>
            <div>
              <div className="card-title">집밥</div>
              <div className="card-subtitle">이번 달 부모님이 해준 밥이 몇 끼예요?</div>
            </div>
          </div>
          <div className="counter">
            <button className="counter-btn" onClick={() => set("meals", Math.max(0, inputs.meals - 5))}>−</button>
            <div>
              <div className="counter-value">{inputs.meals}</div>
              <div className="counter-unit">끼</div>
            </div>
            <button className="counter-btn" onClick={() => set("meals", Math.min(90, inputs.meals + 5))}>+</button>
          </div>
          <input className="slider" type="range" min={0} max={90} step={1} value={inputs.meals}
            onChange={e => set("meals", Number(e.target.value))} />
          <div className="slider-labels"><span>0끼</span><span>45끼</span><span>90끼</span></div>
        </div>

        {/* 빨래 */}
        <div className="card">
          <div className="card-header">
            <span className="card-emoji">🧺</span>
            <div>
              <div className="card-title">빨래</div>
              <div className="card-subtitle">이번 달 부모님이 빨래 몇 번 해줬어요?</div>
            </div>
          </div>
          <div className="counter">
            <button className="counter-btn" onClick={() => set("laundry", Math.max(0, inputs.laundry - 1))}>−</button>
            <div>
              <div className="counter-value">{inputs.laundry}</div>
              <div className="counter-unit">회</div>
            </div>
            <button className="counter-btn" onClick={() => set("laundry", Math.min(20, inputs.laundry + 1))}>+</button>
          </div>
          <input className="slider" type="range" min={0} max={20} step={1} value={inputs.laundry}
            onChange={e => set("laundry", Number(e.target.value))} />
          <div className="slider-labels"><span>0회</span><span>10회</span><span>20회</span></div>
        </div>

        {/* 청소 */}
        <div className="card">
          <div className="card-header">
            <span className="card-emoji">🧹</span>
            <div>
              <div className="card-title">청소</div>
              <div className="card-subtitle">집 청소를 주로 누가 해요?</div>
            </div>
          </div>
          <div className="chips">
            {([ ["me", "내가 해", "부모님 쉬세요"], ["half", "반반씩", "그나마 양심"], ["parents", "부모님이", "착취 확정"] ] as const).map(([v, label, sub]) => (
              <button key={v} className={`chip${inputs.cleaning === v ? " selected" : ""}`} onClick={() => set("cleaning", v)}>
                {label}<span className="chip-label">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 월세 */}
        <div className="card">
          <div className="card-header">
            <span className="card-emoji">🏠</span>
            <div>
              <div className="card-title">자취 예상 월세</div>
              <div className="card-subtitle">내가 자취하면 월세 얼마일 것 같아요?</div>
            </div>
          </div>
          <div className="chips">
            {([ [50, "50만", "고시원/외곽"], [70, "70만", "빌라/원룸"], [100, "100만", "역세권"], [150, "150만+", "서울 핵심"] ] as const).map(([v, label, sub]) => (
              <button key={v} className={`chip${inputs.rent === v ? " selected" : ""}`} onClick={() => set("rent", v)}>
                {label}<span className="chip-label">{sub}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="input-footer">
        <button className="btn-primary" onClick={onCalculate}>등골 빼먹은 금액 계산하기 →</button>
      </div>
    </div>
  );
}

// ── Result Screen ────────────────────────────────────
interface ResultScreenProps {
  inputs: Inputs;
  result: Result;
  onRetry: () => void;
}

function ResultScreen({ inputs, result, onRetry }: ResultScreenProps) {
  const displayTotal = useCountUp(result.total);
  const rank = getRank(result.hourlyWage);
  const pct = getPercentile(result.total);

  function handleShare() {
    const text =
      `🦘 캥거루족 시급 계산기\n\n` +
      `이번 달 등골 빼먹은 총액: ₩${fmt(result.total)}\n` +
      `시급으로 치면: ₩${fmt(result.hourlyWage)}/시간\n` +
      `직급: ${rank.emoji} ${rank.rank}\n` +
      `전국 캥거루족 상위 ${pct}%\n\n` +
      `엄마 잔소리는 덤 🙂‍↔️`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard?.writeText(text);
    }
  }

  const breakdown = [
    { emoji: "🍚", name: "집밥",    detail: `${inputs.meals}끼 × ${fmt(MEAL_PRICE)}원`,     amount: result.mealCost },
    { emoji: "🧺", name: "빨래",    detail: `${inputs.laundry}회 × ${fmt(LAUNDRY_PRICE)}원`, amount: result.laundryCost },
    { emoji: "🧹", name: "청소",    detail: CLEANING_LABEL[inputs.cleaning],                amount: result.cleaningCost },
    { emoji: "🏠", name: "주거비",  detail: `${inputs.rent}만원/월 기준`,                    amount: result.rentCost },
  ];

  return (
    <div className="screen">
      <div className="result-header">
        <div className="result-label">🔥 이번달 착취 리포트 🔥</div>
        <div className="result-total-label">등골 빼먹은 총액</div>
        <div className="result-total">
          <span className="result-total-unit">₩ </span>{fmt(displayTotal)}
        </div>
      </div>

      <div className="result-body">
        <div className="breakdown-card">
          <div className="breakdown-title">항목별 내역</div>
          {breakdown.map(item => (
            <div className="breakdown-item" key={item.name}>
              <div className="breakdown-item-left">
                <span className="breakdown-item-emoji">{item.emoji}</span>
                <div>
                  <div className="breakdown-item-name">{item.name}</div>
                  <div className="breakdown-item-detail">{item.detail}</div>
                </div>
              </div>
              <div className="breakdown-item-amount">₩{fmt(item.amount)}</div>
            </div>
          ))}
        </div>

        <div className="rank-card">
          <div className="hourly-label">시급으로 치면</div>
          <div className="hourly-value">{fmt(result.hourlyWage)}<span className="hourly-unit"> 원/시간</span></div>
          <div className="divider" />
          <span className="rank-emoji">{rank.emoji}</span>
          <div className="rank-text">{rank.rank}</div>
          <div className="rank-comment">{rank.comment}</div>
        </div>

        <div className="percentile-card">
          <div className="percentile-label">전국 캥거루족 중에서</div>
          <div className="percentile-value">상위 <span>{pct}</span>%</div>
          <div className="percentile-sub">의 착취력을 보여주고 있어요</div>
        </div>

        <div className="jangniso-card">
          <div className="jangniso-text">엄마 잔소리는 덤 🙂‍↔️</div>
        </div>
      </div>

      <div className="result-footer">
        <button className="btn-secondary" onClick={onRetry}>다시 계산</button>
        <button className="btn-share" onClick={handleShare}>💬 카톡으로 공유</button>
      </div>
    </div>
  );
}
