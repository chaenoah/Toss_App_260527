import { useState } from "react";
import { Button, Top } from "@toss/tds-mobile";
import { calculate, type RefinanceInput, type CalcResult, type RepaymentType } from "./calc";
import "./App.css";

const TOSS_BLUE = "#3182F6";
const SURFACE = "#F9FAFB";
const BORDER = "#E5E8EB";
const TEXT_SECONDARY = "#8B95A1";
const RED = "#F04452";
const GREEN = "#00B493";

function formatWon(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.floor((abs % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (abs >= 10_000) {
    return `${Math.round(abs / 10_000).toLocaleString()}만원`;
  }
  return `${Math.round(abs).toLocaleString()}원`;
}

function formatWonExact(n: number): string {
  return `${Math.round(Math.abs(n)).toLocaleString()}원`;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  placeholder?: string;
  inputMode?: "decimal" | "numeric";
}

function InputField({ label, value, onChange, suffix, placeholder, inputMode = "decimal" }: InputFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{
        display: "flex", alignItems: "center",
        background: SURFACE, border: `1px solid ${BORDER}`,
        borderRadius: 12, padding: "0 14px", height: 48,
      }}>
        <input
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1, border: "none", background: "transparent",
            fontSize: 16, outline: "none", color: "#191F28",
          }}
        />
        {suffix && <span style={{ color: TEXT_SECONDARY, fontSize: 14, marginLeft: 4 }}>{suffix}</span>}
      </div>
    </div>
  );
}

interface SegmentProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function Segment({ options, value, onChange }: SegmentProps) {
  return (
    <div style={{
      display: "flex", background: SURFACE, borderRadius: 10,
      border: `1px solid ${BORDER}`, padding: 3, gap: 3,
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          flex: 1, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 600, transition: "all 0.15s",
          background: value === opt.value ? "#fff" : "transparent",
          color: value === opt.value ? TOSS_BLUE : TEXT_SECONDARY,
          boxShadow: value === opt.value ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 700, color: "#191F28", margin: "24px 0 12px" }}>
      {children}
    </div>
  );
}

function ResultRow({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <div style={{ fontSize: 14, color: TEXT_SECONDARY }}>{label}</div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: color || "#191F28" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
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

export default function App() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");

  function set(key: keyof typeof DEFAULT_FORM, val: string) {
    setForm(f => ({ ...f, [key]: val }));
    setResult(null);
    setError("");
  }

  function parseNum(s: string): number {
    return parseFloat(s.replace(/,/g, "")) || 0;
  }

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
    if (currentRate <= 0 || newRate <= 0) {
      setError("금리는 0보다 커야 해요.");
      return;
    }

    const input: RefinanceInput = {
      current: { balance, annualRate: currentRate, months: currentMonths, repaymentType: form.currentRepayment },
      newRate,
      newMonths,
      newRepaymentType: form.newRepayment,
      prepaymentFeeType: form.feeType,
      prepaymentFeeAmount: parseNum(form.feeAmount) * 10_000,
      prepaymentFeeRate: parseNum(form.feeRate),
    };

    setResult(calculate(input));
    setError("");

    setTimeout(() => {
      document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleReset() {
    setForm(DEFAULT_FORM);
    setResult(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const repaymentOptions = [
    { value: "equalPayment", label: "원리금균등" },
    { value: "equalPrincipal", label: "원금균등" },
  ];
  const feeTypeOptions = [
    { value: "amount", label: "직접 금액" },
    { value: "rate", label: "요율 입력" },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      <Top
        title={<Top.TitleParagraph size={22}>대출 갈아타기{"\n"}손익계산기</Top.TitleParagraph>}
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            갈아타는 게 진짜 이득인지 계산해 드려요
          </Top.SubtitleParagraph>
        }
      />

      <div style={{ padding: "0 20px" }}>
        {/* 현재 대출 */}
        <SectionTitle>현재 대출</SectionTitle>
        <InputField label="대출 잔액" value={form.balance} onChange={v => set("balance", v)} suffix="만원" placeholder="예) 5000" />
        <InputField label="현재 금리 (연)" value={form.currentRate} onChange={v => set("currentRate", v)} suffix="%" placeholder="예) 5.5" />
        <InputField label="남은 기간" value={form.currentMonths} onChange={v => set("currentMonths", v)} suffix="개월" placeholder="예) 240" inputMode="numeric" />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 6, fontWeight: 500 }}>상환 방식</div>
          <Segment options={repaymentOptions} value={form.currentRepayment} onChange={v => set("currentRepayment", v as RepaymentType)} />
        </div>

        {/* 갈아탈 대출 */}
        <SectionTitle>갈아탈 대출</SectionTitle>
        <InputField label="새 금리 (연)" value={form.newRate} onChange={v => set("newRate", v)} suffix="%" placeholder="예) 4.2" />
        <InputField label="새 기간" value={form.newMonths} onChange={v => set("newMonths", v)} suffix="개월" placeholder="예) 300" inputMode="numeric" />
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: TEXT_SECONDARY, marginBottom: 6, fontWeight: 500 }}>상환 방식</div>
          <Segment options={repaymentOptions} value={form.newRepayment} onChange={v => set("newRepayment", v as RepaymentType)} />
        </div>

        {/* 중도상환수수료 */}
        <SectionTitle>중도상환수수료</SectionTitle>
        <div style={{ marginBottom: 12 }}>
          <Segment options={feeTypeOptions} value={form.feeType} onChange={v => set("feeType", v as "amount" | "rate")} />
        </div>
        {form.feeType === "amount" ? (
          <InputField label="수수료 금액" value={form.feeAmount} onChange={v => set("feeAmount", v)} suffix="만원" placeholder="없으면 0 또는 비워두세요" />
        ) : (
          <InputField label="수수료 요율" value={form.feeRate} onChange={v => set("feeRate", v)} suffix="%" placeholder="예) 1.2" />
        )}

        {error && (
          <div style={{ color: RED, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>
        )}

        <Button onClick={handleCalc} style={{ width: "100%", marginTop: 8 }}>
          계산하기
        </Button>

        {/* 결과 */}
        {result && (
          <div id="result-section" style={{ marginTop: 32 }}>
            {/* 결론 카드 */}
            <div style={{
              background: result.isWorthRefinancing
                ? "linear-gradient(135deg, #E8F8F3, #D4F1E8)"
                : "linear-gradient(135deg, #FEF0F0, #FDDEDE)",
              borderRadius: 16, padding: "20px",
              border: `1px solid ${result.isWorthRefinancing ? "#A8E5D0" : "#F9C0C0"}`,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: result.isWorthRefinancing ? GREEN : RED, marginBottom: 8 }}>
                {result.isWorthRefinancing ? "✅ 갈아타는 게 이득이에요" : "⚠️ 갈아타면 손해예요"}
              </div>
              <div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.6 }}>
                {result.isWorthRefinancing
                  ? `수수료를 내고도 ${formatWon(result.netBenefit)}을 절약할 수 있어요.`
                  : `수수료가 이자 절감액보다 ${formatWon(Math.abs(result.netBenefit))} 더 많아요.`}
              </div>
              {result.breakEvenMonths !== null ? (
                <div style={{ marginTop: 10, fontSize: 13, color: "#6B7280" }}>
                  💡 손익분기점까지{" "}
                  <b style={{ color: result.isWorthRefinancing ? TOSS_BLUE : RED }}>
                    {result.breakEvenMonths}개월
                  </b>
                  {result.breakEvenMonths >= 12 && ` (약 ${Math.ceil(result.breakEvenMonths / 12)}년)`}
                  {result.isWorthRefinancing
                    ? " 후부터 순수 절약이에요"
                    : " 이 지나야 본전인데, 남은 기간보다 길어요"}
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 13, color: "#6B7280" }}>
                  💡 중도상환수수료가 없어 갈아타는 즉시 이득이에요
                </div>
              )}
            </div>

            {/* 상세 결과 */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "0 16px", border: `1px solid ${BORDER}` }}>
              <ResultRow
                label="현재 월 납입액"
                value={formatWonExact(result.currentMonthlyFirst)}
                sub="첫 달 기준"
              />
              <ResultRow
                label="새 월 납입액"
                value={formatWonExact(result.newMonthlyFirst)}
                sub="첫 달 기준"
              />
              <ResultRow
                label="월 납입액 차이"
                value={result.monthlyDiff >= 0
                  ? `월 ${formatWonExact(result.monthlyDiff)} 절약`
                  : `월 ${formatWonExact(result.monthlyDiff)} 증가`}
                color={result.monthlyDiff >= 0 ? GREEN : RED}
              />
              <ResultRow label="현재 총 이자" value={formatWon(result.currentTotalInterest)} />
              <ResultRow label="새 총 이자" value={formatWon(result.newTotalInterest)} />
              <ResultRow
                label="총 이자 절감"
                value={result.interestDiff >= 0
                  ? `${formatWon(result.interestDiff)} 절약`
                  : `${formatWon(Math.abs(result.interestDiff))} 증가`}
                color={result.interestDiff >= 0 ? GREEN : RED}
              />
              {result.prepaymentFee > 0 && (
                <ResultRow
                  label="중도상환수수료"
                  value={`− ${formatWon(result.prepaymentFee)}`}
                  color={RED}
                />
              )}
              <ResultRow
                label="최종 순이익"
                value={result.netBenefit >= 0
                  ? `${formatWon(result.netBenefit)} 이득`
                  : `${formatWon(Math.abs(result.netBenefit))} 손해`}
                color={result.netBenefit >= 0 ? GREEN : RED}
              />
            </div>

            <button onClick={handleReset} style={{
              width: "100%", marginTop: 16, height: 48,
              background: "transparent", border: `1px solid ${BORDER}`,
              borderRadius: 12, fontSize: 15, color: TEXT_SECONDARY,
              cursor: "pointer",
            }}>
              다시 계산하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
