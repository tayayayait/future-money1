/**
 * 한국은행 경제통계시스템 (ECOS) API 클라이언트
 * 
 * 실시간 경제 데이터를 가져와 시뮬레이션에 활용
 */

const ECOS_API_KEY = import.meta.env.VITE_ECOS_API_KEY;
// 개발 환경에서는 프록시 사용, 프로덕션에서는 Supabase Edge Function 사용
const ECOS_BASE_URL = '/ecos-api'; // Vercel 및 Vite Proxy 사용

// API 키 확인
export function isEcosConfigured(): boolean {
  return Boolean(ECOS_API_KEY);
}

// 통계표 코드 정의
export const STAT_CODES = {
  BASE_RATE: '722Y001',        // 한국은행 기준금리
  CPI: '901Y009',               // 소비자물가지수
  KOSPI: '802Y001',             // 코스피지수
  EXCHANGE_RATE: '731Y001',     // 원/달러 환율
} as const;

// 항목 코드 정의
export const ITEM_CODES = {
  BASE_RATE: '0101000',         // 기준금리
  CPI_TOTAL: '0',               // 소비자물가총지수
  KOSPI_CLOSE: '0001000',       // KOSPI 종가
  USD_KRW: '0000001',           // 원/달러 매매기준율
} as const;

// 주기 타입
export type Frequency = 'D' | 'M' | 'Q' | 'Y'; // Daily, Monthly, Quarterly, Yearly

// API 응답 타입
interface EcosRow {
  STAT_NAME: string;            // 통계명
  STAT_CODE: string;            // 통계표코드
  ITEM_CODE1: string;           // 항목코드1
  ITEM_NAME1: string;           // 항목명1
  DATA_VALUE: string;           // 데이터값
  TIME: string;                 // 시점
  UNIT_NAME: string;            // 단위
}

interface EcosResponse {
  StatisticSearch: {
    list_total_count: number;
    row: EcosRow[];
  };
}

/**
 * ECOS API 통계 조회
 */
async function fetchStatistic(
  statCode: string,
  itemCode: string,
  frequency: Frequency,
  startDate: string,
  endDate: string
): Promise<EcosRow[]> {
  if (!ECOS_API_KEY) {
    throw new Error('ECOS API 키가 설정되지 않았습니다');
  }

  // URL 구성
  const url = `${ECOS_BASE_URL}/StatisticSearch/${ECOS_API_KEY}/json/kr/1/100/${statCode}/${frequency}/${startDate}/${endDate}/${itemCode}`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`ECOS API 요청 실패: ${response.status}`);
  }

  const data: EcosResponse = await response.json();
  
  if (!data.StatisticSearch || !data.StatisticSearch.row) {
    throw new Error('ECOS API 응답 데이터가 없습니다');
  }

  return data.StatisticSearch.row;
}

/**
 * 최신 기준금리 조회 (%)
 */
export async function getLatestBaseRate(): Promise<number> {
  const now = new Date();
  const startDate = formatDate(new Date(now.getFullYear(), now.getMonth() - 6, 1)); // 6개월 전
  const endDate = formatDate(now);

  const data = await fetchStatistic(
    STAT_CODES.BASE_RATE,
    ITEM_CODES.BASE_RATE,
    'D', // 일별 데이터
    startDate,
    endDate
  );

  if (data.length === 0) {
    throw new Error('기준금리 데이터를 찾을 수 없습니다');
  }

  // 최신 데이터 (가장 마지막)
  const latest = data[data.length - 1];
  return parseFloat(latest.DATA_VALUE);
}

/**
 * 최신 소비자물가지수 전년대비 증감률 (인플레이션율, %)
 */
export async function getLatestInflationRate(): Promise<number> {
  const now = new Date();
  const startDate = formatYearMonth(new Date(now.getFullYear() - 1, now.getMonth())); // 1년 전
  const endDate = formatYearMonth(now);

  const data = await fetchStatistic(
    STAT_CODES.CPI,
    ITEM_CODES.CPI_TOTAL,
    'M', // 월별 데이터
    startDate,
    endDate
  );

  if (data.length < 2) {
    throw new Error('물가지수 데이터가 부족합니다');
  }

  // 최신 데이터와 1년 전 데이터 비교
  const latest = parseFloat(data[data.length - 1].DATA_VALUE);
  const yearAgo = parseFloat(data[0].DATA_VALUE);

  // 전년대비 증감률 계산
  const inflationRate = ((latest - yearAgo) / yearAgo) * 100;
  return inflationRate;
}

/**
 * 기준금리 기반 투자 수익률 추정 (%)
 * 
 * 일반적으로 안전자산 수익률 = 기준금리 + 0.5~1.5%
 * 위험자산 수익률 = 기준금리 + 2~4%
 */
export async function estimateInvestmentReturn(riskLevel: 'low' | 'medium' | 'high' = 'medium'): Promise<number> {
  const baseRate = await getLatestBaseRate();
  
  const premiums = {
    low: 1.0,      // 예적금 수준
    medium: 3.0,   // 채권/배당주 수준
    high: 5.0,     // 주식 수준
  };

  return baseRate + premiums[riskLevel];
}

/**
 * 환율 조회 (원/달러)
 */
export async function getLatestExchangeRate(): Promise<number> {
  const now = new Date();
  const startDate = formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)); // 1개월 전
  const endDate = formatDate(now);

  const data = await fetchStatistic(
    STAT_CODES.EXCHANGE_RATE,
    ITEM_CODES.USD_KRW,
    'D',
    startDate,
    endDate
  );

  if (data.length === 0) {
    throw new Error('환율 데이터를 찾을 수 없습니다');
  }

  const latest = data[data.length - 1];
  return parseFloat(latest.DATA_VALUE);
}

/**
 * 경제 데이터 요약
 */
export interface EconomicData {
  baseRate: number;              // 기준금리 (%)
  inflationRate: number;         // 인플레이션율 (%)
  exchangeRate: number;          // 환율 (원)
  estimatedReturn: {
    low: number;                 // 저위험 투자 수익률 (%)
    medium: number;              // 중위험 투자 수익률 (%)
    high: number;                // 고위험 투자 수익률 (%)
  };
  fetchedAt: Date;
}

/**
 * 모든 경제 데이터 한번에 조회
 */
export async function getAllEconomicData(): Promise<EconomicData> {
  const [baseRate, inflationRate, exchangeRate] = await Promise.all([
    getLatestBaseRate(),
    getLatestInflationRate(),
    getLatestExchangeRate(),
  ]);

  return {
    baseRate,
    inflationRate,
    exchangeRate,
    estimatedReturn: {
      low: baseRate + 1.0,
      medium: baseRate + 3.0,
      high: baseRate + 5.0,
    },
    fetchedAt: new Date(),
  };
}

// ===== 유틸리티 함수 =====

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 날짜를 YYYYMM 형식으로 변환
 */
function formatYearMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}${month}`;
}
