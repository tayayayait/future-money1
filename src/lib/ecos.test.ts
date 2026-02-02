/**
 * ECOS API 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isEcosConfigured,
  getLatestBaseRate,
  getLatestInflationRate,
  getLatestExchangeRate,
  estimateInvestmentReturn,
  getAllEconomicData,
} from './ecos';

// Mock fetch
global.fetch = vi.fn();

describe('ECOS API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('API 키가 설정되어 있는지 확인', () => {
    const configured = isEcosConfigured();
    expect(typeof configured).toBe('boolean');
  });

  it('기준금리를 조회할 수 있어야 함', async () => {
    // Mock 응답
    const mockResponse = {
      StatisticSearch: {
        list_total_count: 1,
        row: [
          {
            STAT_NAME: '한국은행 기준금리',
            STAT_CODE: '722Y001',
            ITEM_CODE1: '0101000',
            ITEM_NAME1: '한국은행 기준금리',
            DATA_VALUE: '3.50',
            TIME: '20240131',
            UNIT_NAME: '%',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const rate = await getLatestBaseRate();
    expect(rate).toBe(3.50);
  });

  it('인플레이션율을 조회할 수 있어야 함', async () => {
    const mockResponse = {
      StatisticSearch: {
        list_total_count: 13,
        row: [
          // 1년 전
          {
            STAT_NAME: '소비자물가조사',
            STAT_CODE: '901Y009',
            ITEM_CODE1: '0',
            ITEM_NAME1: '소비자물가총지수',
            DATA_VALUE: '108.50',
            TIME: '202301',
            UNIT_NAME: '2020=100',
          },
          // 최근
          {
            STAT_NAME: '소비자물가조사',
            STAT_CODE: '901Y009',
            ITEM_CODE1: '0',
            ITEM_NAME1: '소비자물가총지수',
            DATA_VALUE: '111.68',
            TIME: '202401',
            UNIT_NAME: '2020=100',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const inflationRate = await getLatestInflationRate();
    
    // (111.68 - 108.50) / 108.50 * 100 = 약 2.93%
    expect(inflationRate).toBeCloseTo(2.93, 1);
  });

  it('투자 수익률을 추정할 수 있어야 함', async () => {
    const mockResponse = {
      StatisticSearch: {
        list_total_count: 1,
        row: [
          {
            STAT_NAME: '한국은행 기준금리',
            STAT_CODE: '722Y001',
            ITEM_CODE1: '0101000',
            ITEM_NAME1: '한국은행 기준금리',
            DATA_VALUE: '3.50',
            TIME: '20240131',
            UNIT_NAME: '%',
          },
        ],
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const lowRisk = await estimateInvestmentReturn('low');
    const mediumRisk = await estimateInvestmentReturn('medium');
    const highRisk = await estimateInvestmentReturn('high');

    expect(lowRisk).toBe(4.5);    // 3.5 + 1.0
    expect(mediumRisk).toBe(6.5);  // 3.5 + 3.0
    expect(highRisk).toBe(8.5);    // 3.5 + 5.0
  });

  it('모든 경제 데이터를 한번에 조회할 수 있어야 함', async () => {
    // 세 개의 API 호출을 모킹
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          StatisticSearch: {
            list_total_count: 1,
            row: [{ DATA_VALUE: '3.50' }],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          StatisticSearch: {
            list_total_count: 2,
            row: [
              { DATA_VALUE: '108.50' },
              { DATA_VALUE: '111.68' },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          StatisticSearch: {
            list_total_count: 1,
            row: [{ DATA_VALUE: '1300.50' }],
          },
        }),
      });

    const data = await getAllEconomicData();

    expect(data.baseRate).toBe(3.50);
    expect(data.inflationRate).toBeCloseTo(2.93, 1);
    expect(data.exchangeRate).toBe(1300.50);
    expect(data.estimatedReturn.low).toBe(4.5);
    expect(data.estimatedReturn.medium).toBe(6.5);
    expect(data.estimatedReturn.high).toBe(8.5);
    expect(data.fetchedAt).toBeInstanceOf(Date);
  });

  it('API 응답이 없을 때 에러를 발생시켜야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await expect(getLatestBaseRate()).rejects.toThrow('ECOS API 응답 데이터가 없습니다');
  });

  it('API 요청 실패 시 에러를 발생시켜야 함', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getLatestBaseRate()).rejects.toThrow('ECOS API 요청 실패: 500');
  });
});
