import { useState } from "react";
import { Button, Top } from "@toss/tds-mobile";
import { calculate, type RefinanceInput, type CalcResult, type RepaymentType } from "./calc";
import "./App.css";

const BLUE = "#3182F6";
const SURFACE = "#F9FAFB";
const BORDER = "#E5E8EB";
const MUTED = "#8B95A1";
const RED = "#F04452";
const GREEN = "#00B493";
const TEXT = "#191F28";

/* ── 포매팅 ─────────────────────────────────────── */
function formatWonLabel(manwon: number): string {
  if (!manwon) return "";
  const won = manwon * 10_000;
  if (won >= 100_000_000) {
    const eok = Math.floor(won / 100_000_000);
    const man = Math.floor((won % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  return `${manwon.toLocaleString()}만원`;
}

function formatWon(n: number): string {
  const a = Math.abs(n);
  if (a >= 100_000_000) {
    const eok = Math.floor(a / 100_000_000);
    const man = Math.floor((a % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (a >= 10_000) return `${Math.round(a / 10_000).toLocaleString()}만원`;
  return `${Math.round(a).toLocaleString()}원`;
}

function formatWonExact(n: number): string {
  return `${Math.round(Math.abs(n)).toLocaleString()}원`;
}

/* ── 컴포넌트 ────────────────────────────────────── */
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
  hint?: string;
}

function InputField({ label, value, onChange, suffix, placeholder, inputMode = "decimal", hint }: InputFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: BLUE, fontWeight: 600 }}>{hint}</span>}
      </div>
      <div style={{
        display: "flex", alignItems: "center",
        background: SURFACE, border: `1.5px solid ${value ? BLUE + "44" : BORDER}`,
        borderRadius: 12, padding: "0 14px", height: 50,
        transition: "border-color 0.15s",
      }}>
        <input
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, border: "none", background: "transparent", fontSize: 16, outline: "none", color: TEXT }}
        />
        {suffix && <span style={{ color: MUTED, fontSize: 14, marginLeft: 4, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

interface SegmentProps {
  options: { value: string; label: string; sub?: string }[];
  value: string;
  onChange: (v: string) => void;
}

function Segment({ options, value, onChange }: SegmentProps) {
  return (
    <div style={{
      display: "flex", background: SURFACE, borderRadius: 10,
      border: `1px solid ${BORDER}`, padding: 3, gap: 3,
    }}>
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            flex: 1, height: opt.sub ? 44 : 38, borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            background: active ? "#fff" : "transparent",
            color: active ? BLUE : MUTED,
            boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            lineHeight: 1.2,
          }}>
            <div>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 10, fontWeight: 400, marginTop: 1 }}>{opt.sub}</div>}
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 20px 4px", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function ResultRow({ label, value, sub, color, large }: { label: string; value: string; sub?: string; color?: string; large?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ fontSize: 14, color: MUTED }}>{label}</div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: large ? 18 : 16, fontWeight: 700, color: color || TEXT }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── 기본값 ──────────────────────────────────────── */
const DEFAULT = {
  balance: "",
  currentRate: "",
  currentMonths: "",
  currentRepayment: "equalPayment" as RepaymentType,
  newRate: "",
  newMonths: "",
  newRepayment: "equalPayment" as RepaymentType,
  feeType: "amount" as "amount" | "rate",
  feeAmount: "",
  feeRate: "",
};

/* ── 메인 ────────────────────────────────────────── */
export default function App() {
  const [form, setForm] = useState(DEFAULT);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");

  function set(key: keyof typeof DEFAULT, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setResult(null);
    setError("");
  }

  function parseNum(s: string): number {
    return parseFloat(s.replace(/,/g, "")) || 0;
  }

  const balanceWon = parseNum(form.balance);
  const balanceHint = balanceWon > 0 ? formatWonLabel(balanceWon) : undefined;

  function handleCalc() {
    const balance = parseNum(form.balance) * 10_000;
    const currentRate = parseNum(form.currentRate);
    const currentMonths = parseInt(form.currentMonths) || 0;
    const newRate = parseNum(form.newRate);
    const newMonths = parseInt(form.newMonths) || 0;

    if (!balance || !currentRate || !currentMonths || !newRate || !newMonths) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }

    const input: RefinanceInput = {
      current: { balance, annualRate: currentRate, months: currentMonths, repaymentType: form.currentRepayment },
      newRate, newMonths, newRepaymentType: form.newRepayment,
      prepaymentFeeType: form.feeType,
      prepaymentFeeAmount: parseNum(form.feeAmount) * 10_000,
      prepaymentFeeRate: parseNum(form.feeRate),
    };

    setResult(calculate(input));
    setError("");
    setTimeout(() => {
      document.getElementById("result-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleReset() {
    setForm(DEFAULT);
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const repaymentOptions = [
    { value: "equalPayment", label: "원리금균등", sub: "매달 동일 금액" },
    { value: "equalPrincipal", label: "원금균등", sub: "매달 원금 동일" },
  ];
  const feeOptions = [
    { value: "amount", label: "직접 금액 입력" },
    { value: "rate", label: "요율로 계산" },
  ];

  return (
    <div style={{ paddingBottom: 48, background: "#F5F6F8", minHeight: "100vh" }}>
      {/* 헤더 */}
      <div style={{ background: "#fff", paddingBottom: 8 }}>
        <Top
          title={<Top.TitleParagraph size={22}>대출 갈아타기{"\n"}손익계산기</Top.TitleParagraph>}
          subtitleBottom={
            <Top.SubtitleParagraph size={15}>
              수수료까지 고려해서 진짜 이득인지 알려드려요
            </Top.SubtitleParagraph>
          }
        />
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* 현재 대출 */}
        <SectionCard title="📋 현재 대출">
          <InputField
            label="대출 잔액" value={form.balance} onChange={v => set("balance", v)}
            suffix="만원" placeholder="예) 30000" hint={balanceHint}
          />
          <InputField
            label="현재 금리 (연)" value={form.currentRate} onChange={v => set("currentRate", v)}
            suffix="%" placeholder="예) 5.5"
          />
          <InputField
            label="남은 기간" value={form.currentMonths} onChange={v => set("currentMonths", v)}
            suffix="개월" placeholder="예) 240 (20년)" inputMode="numeric"
          />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginBottom: 6 }}>상환 방식</div>
            <Segment options={repaymentOptions} value={form.currentRepayment} onChange={v => set("currentRepayment", v as RepaymentType)} />
          </div>
        </SectionCard>

        {/* 갈아탈 대출 */}
        <SectionCard title="🔄 갈아탈 대출">
          <InputField
            label="새 금리 (연)" value={form.newRate} onChange={v => set("newRate", v)}
            suffix="%" placeholder="예) 3.9"
          />
          <InputField
            label="새 기간" value={form.newMonths} onChange={v => set("newMonths", v)}
            suffix="개월" placeholder="예) 240 (20년)" inputMode="numeric"
          />
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: MUTED, fontWeight: 500, marginBottom: 6 }}>상환 방식</div>
            <Segment options={repaymentOptions} value={form.newRepayment} onChange={v => set("newRepayment", v as RepaymentType)} />
          </div>
        </SectionCard>

        {/* 중도상환수수료 */}
        <SectionCard title="💸 중도상환수수료">
          <div style={{ marginBottom: 12 }}>
            <Segment options={feeOptions} value={form.feeType} onChange={v => set("feeType", v as "amount" | "rate")} />
          </div>
          {form.feeType === "amount" ? (
            <InputField
              label="수수료 금액" value={form.feeAmount} onChange={v => set("feeAmount", v)}
              suffix="만원" placeholder="없으면 0 또는 비워두세요"
            />
          ) : (
            <InputField
              label="수수료 요율" value={form.feeRate} onChange={v => set("feeRate", v)}
              suffix="%" placeholder="예) 1.2"
              hint={form.feeRate && balanceWon ? `≈ ${formatWon(balanceWon * 10_000 * parseNum(form.feeRate) / 100)}` : undefined}
            />
          )}
          <div style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
            💡 은행 앱 또는 대출 계약서에서 확인할 수 있어요
          </div>
        </SectionCard>

        {error && (
          <div style={{
            background: "#FFF0F0", border: `1px solid #FFCCCC`,
            borderRadius: 10, padding: "12px 16px",
            color: RED, fontSize: 14, marginBottom: 12, textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <Button
          color="primary"
          display="block"
          size="xlarge"
          onClick={handleCalc}
          style={{ width: "100%", marginBottom: 8 }}
        >
          손익 계산하기
        </Button>
      </div>

      {/* 결과 */}
      {result && (
        <div id="result-top" style={{ padding: "24px 16px 0" }}>

          {/* 결론 배너 */}
          <div style={{
            background: result.isWorthRefinancing
              ? `linear-gradient(135deg, #E6F6F0, #CCF0E3)`
              : `linear-gradient(135deg, #FEF0F0, #FDDEDE)`,
            borderRadius: 20, padding: "24px 20px",
            border: `1.5px solid ${result.isWorthRefinancing ? "#99DFC0" : "#F5AAAA"}`,
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: result.isWorthRefinancing ? GREEN : RED, marginBottom: 10 }}>
              {result.isWorthRefinancing ? "✅ 갈아타세요!" : "⚠️ 갈아타면 손해예요"}
            </div>

            {/* 순이익 강조 */}
            <div style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 12,
              padding: "14px 16px", marginBottom: 12,
            }}>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 4 }}>수수료 제외 최종 손익</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: result.netBenefit >= 0 ? GREEN : RED }}>
                {result.netBenefit >= 0 ? "+" : "−"}{formatWon(Math.abs(result.netBenefit))}
              </div>
            </div>

            {/* 손익분기점 */}
            {result.breakEvenMonths !== null ? (
              <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
                📅 수수료 회수까지{" "}
                <b style={{ color: result.isWorthRefinancing ? BLUE : RED }}>
                  {result.breakEvenMonths}개월
                  {result.breakEvenMonths >= 12 ? ` (약 ${Math.ceil(result.breakEvenMonths / 12)}년)` : ""}
                </b>
                {result.isWorthRefinancing
                  ? " — 그 이후부터 순수 절약이에요"
                  : " — 남은 기간 안에 회수가 안 돼요"}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#374151" }}>
                🎉 수수료가 없어 갈아타는 즉시 이득이에요
              </div>
            )}
          </div>

          {/* 상세 비교표 */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "4px 20px", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, padding: "14px 0 4px" }}>월 납입액 비교</div>
            <ResultRow label="현재 월 납입액" value={formatWonExact(result.currentMonthlyFirst)} sub="첫 달 기준" />
            <ResultRow label="새 월 납입액" value={formatWonExact(result.newMonthlyFirst)} sub="첫 달 기준" />
            <ResultRow
              label="월 납입액 차이"
              value={result.monthlyDiff >= 0
                ? `월 ${formatWonExact(result.monthlyDiff)} 절약`
                : `월 ${formatWonExact(result.monthlyDiff)} 증가`}
              color={result.monthlyDiff >= 0 ? GREEN : RED}
              large
            />
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "4px 20px", border: `1px solid ${BORDER}`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: MUTED, padding: "14px 0 4px" }}>총 이자 비교</div>
            <ResultRow label="현재 총 이자" value={formatWon(result.currentTotalInterest)} />
            <ResultRow label="새 총 이자" value={formatWon(result.newTotalInterest)} />
            <ResultRow
              label="이자 절감액"
              value={result.interestDiff >= 0
                ? `${formatWon(result.interestDiff)} 절약`
                : `${formatWon(Math.abs(result.interestDiff))} 증가`}
              color={result.interestDiff >= 0 ? GREEN : RED}
              large
            />
            {result.prepaymentFee > 0 && (
              <ResultRow label="중도상환수수료" value={`− ${formatWon(result.prepaymentFee)}`} color={RED} />
            )}
            <ResultRow
              label="최종 순이익"
              value={result.netBenefit >= 0
                ? `${formatWon(result.netBenefit)} 이득`
                : `${formatWon(Math.abs(result.netBenefit))} 손해`}
              color={result.netBenefit >= 0 ? GREEN : RED}
              large
            />
          </div>

          {/* 다시 계산 */}
          <button onClick={handleReset} style={{
            width: "100%", height: 52,
            background: "#fff", border: `1.5px solid ${BORDER}`,
            borderRadius: 14, fontSize: 15, color: MUTED,
            cursor: "pointer", fontWeight: 600,
          }}>
            ↩ 다시 계산하기
          </button>
        </div>
      )}
    </div>
  );
}
