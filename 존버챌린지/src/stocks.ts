export type Stock = { ticker: string; name: string; market: "KOSPI" | "KOSDAQ" };

export const STOCKS: Stock[] = [
  { ticker: "005930", name: "삼성전자", market: "KOSPI" },
  { ticker: "000660", name: "SK하이닉스", market: "KOSPI" },
  { ticker: "373220", name: "LG에너지솔루션", market: "KOSPI" },
  { ticker: "207940", name: "삼성바이오로직스", market: "KOSPI" },
  { ticker: "005380", name: "현대차", market: "KOSPI" },
  { ticker: "000270", name: "기아", market: "KOSPI" },
  { ticker: "005490", name: "POSCO홀딩스", market: "KOSPI" },
  { ticker: "035420", name: "NAVER", market: "KOSPI" },
  { ticker: "035720", name: "카카오", market: "KOSPI" },
  { ticker: "051910", name: "LG화학", market: "KOSPI" },
  { ticker: "006400", name: "삼성SDI", market: "KOSPI" },
  { ticker: "068270", name: "셀트리온", market: "KOSPI" },
  { ticker: "105560", name: "KB금융", market: "KOSPI" },
  { ticker: "055550", name: "신한지주", market: "KOSPI" },
  { ticker: "086790", name: "하나금융지주", market: "KOSPI" },
  { ticker: "012330", name: "현대모비스", market: "KOSPI" },
  { ticker: "028260", name: "삼성물산", market: "KOSPI" },
  { ticker: "066570", name: "LG전자", market: "KOSPI" },
  { ticker: "003550", name: "LG", market: "KOSPI" },
  { ticker: "017670", name: "SK텔레콤", market: "KOSPI" },
  { ticker: "030200", name: "KT", market: "KOSPI" },
  { ticker: "032830", name: "삼성생명", market: "KOSPI" },
  { ticker: "015760", name: "한국전력", market: "KOSPI" },
  { ticker: "034020", name: "두산에너빌리티", market: "KOSPI" },
  { ticker: "267260", name: "HD현대일렉트릭", market: "KOSPI" },
  { ticker: "329180", name: "HD현대중공업", market: "KOSPI" },
  { ticker: "010130", name: "고려아연", market: "KOSPI" },
  { ticker: "009150", name: "삼성전기", market: "KOSPI" },
  { ticker: "018260", name: "삼성에스디에스", market: "KOSPI" },
  { ticker: "247540", name: "에코프로비엠", market: "KOSDAQ" },
  { ticker: "086520", name: "에코프로", market: "KOSDAQ" },
  { ticker: "091990", name: "셀트리온헬스케어", market: "KOSDAQ" },
  { ticker: "196170", name: "알테오젠", market: "KOSDAQ" },
  { ticker: "263750", name: "펄어비스", market: "KOSDAQ" },
  { ticker: "293490", name: "카카오게임즈", market: "KOSDAQ" },
  { ticker: "112040", name: "위메이드", market: "KOSDAQ" },
  { ticker: "041510", name: "에스엠", market: "KOSDAQ" },
  { ticker: "035900", name: "JYP Ent.", market: "KOSDAQ" },
  { ticker: "352820", name: "하이브", market: "KOSPI" },
  { ticker: "352480", name: "그리드위즈", market: "KOSDAQ" },
];

export function searchStocks(query: string, limit = 20): Stock[] {
  const q = query.trim().toLowerCase();
  if (!q) return STOCKS.slice(0, limit);
  return STOCKS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.ticker.includes(q),
  ).slice(0, limit);
}
