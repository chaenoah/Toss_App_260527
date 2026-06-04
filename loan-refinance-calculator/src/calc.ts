export type RepaymentType = "equalPayment" | "equalPrincipal";

export interface LoanInput {
  balance: number;         // 대출 잔액 (원)
  annualRate: number;      // 연 금리 (%)
  months: number;          // 남은 기간 (개월)
  repaymentType: RepaymentType;
}

export interface RefinanceInput {
  current: LoanInput;
  newRate: number;         // 갈아탈 연 금리 (%)
  newMonths: number;       // 새 기간 (개월)
  newRepaymentType: RepaymentType;
  prepaymentFeeType: "amount" | "rate"; // 중도상환수수료 입력 방식
  prepaymentFeeAmount: number;          // 직접 금액 (원)
  prepaymentFeeRate: number;            // 요율 (%)
}

export interface CalcResult {
  currentMonthlyFirst: number;   // 현재 대출 첫 달 월납입액
  newMonthlyFirst: number;       // 새 대출 첫 달 월납입액
  monthlyDiff: number;           // 월 납입액 차이 (절약액, 양수=이득)
  currentTotalInterest: number;  // 현재 대출 총 이자
  newTotalInterest: number;      // 새 대출 총 이자
  interestDiff: number;          // 총 이자 차이 (절약액, 양수=이득)
  prepaymentFee: number;         // 실제 중도상환수수료
  netBenefit: number;            // 순이익 (총이자절감 - 수수료)
  breakEvenMonths: number | null; // 손익분기 개월 수 (null=수수료0)
  isWorthRefinancing: boolean;   // 갈아타는 게 이득인지
}

// 원리금균등 월납입액
function equalPaymentMonthly(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// 원리금균등 총이자
function equalPaymentTotalInterest(principal: number, annualRate: number, months: number): number {
  const monthly = equalPaymentMonthly(principal, annualRate, months);
  return monthly * months - principal;
}

// 원금균등 첫 달 납입액
function equalPrincipalFirstMonthly(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  return principal / months + principal * r;
}

// 원금균등 총이자
function equalPrincipalTotalInterest(principal: number, annualRate: number, months: number): number {
  const r = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;
  let totalInterest = 0;
  let remaining = principal;
  for (let i = 0; i < months; i++) {
    totalInterest += remaining * r;
    remaining -= monthlyPrincipal;
  }
  return totalInterest;
}

function getFirstMonthly(input: LoanInput): number {
  if (input.repaymentType === "equalPayment") {
    return equalPaymentMonthly(input.balance, input.annualRate, input.months);
  }
  return equalPrincipalFirstMonthly(input.balance, input.annualRate, input.months);
}

function getTotalInterest(input: LoanInput): number {
  if (input.repaymentType === "equalPayment") {
    return equalPaymentTotalInterest(input.balance, input.annualRate, input.months);
  }
  return equalPrincipalTotalInterest(input.balance, input.annualRate, input.months);
}

export function calculate(input: RefinanceInput): CalcResult {
  const { current, newRate, newMonths, newRepaymentType, prepaymentFeeType, prepaymentFeeAmount, prepaymentFeeRate } = input;

  const newLoan: LoanInput = {
    balance: current.balance,
    annualRate: newRate,
    months: newMonths,
    repaymentType: newRepaymentType,
  };

  const currentMonthlyFirst = getFirstMonthly(current);
  const newMonthlyFirst = getFirstMonthly(newLoan);
  const currentTotalInterest = getTotalInterest(current);
  const newTotalInterest = getTotalInterest(newLoan);

  const prepaymentFee = prepaymentFeeType === "amount"
    ? prepaymentFeeAmount
    : current.balance * (prepaymentFeeRate / 100);

  const interestDiff = currentTotalInterest - newTotalInterest;
  const netBenefit = interestDiff - prepaymentFee;
  const monthlyDiff = currentMonthlyFirst - newMonthlyFirst;

  // 손익분기: 수수료 / 월 절약액 = 몇 달 후 본전
  let breakEvenMonths: number | null = null;
  if (prepaymentFee > 0 && monthlyDiff > 0) {
    breakEvenMonths = Math.ceil(prepaymentFee / monthlyDiff);
  } else if (prepaymentFee === 0) {
    breakEvenMonths = null; // 수수료 없으면 즉시 이득
  }

  const isWorthRefinancing = netBenefit > 0;

  return {
    currentMonthlyFirst,
    newMonthlyFirst,
    monthlyDiff,
    currentTotalInterest,
    newTotalInterest,
    interestDiff,
    prepaymentFee,
    netBenefit,
    breakEvenMonths,
    isWorthRefinancing,
  };
}
