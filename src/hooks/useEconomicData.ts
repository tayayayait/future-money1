/**
 * ECOS 경제 데이터 훅
 */

import { useState, useEffect } from 'react';
import { getAllEconomicData, type EconomicData } from '@/lib/ecos';

interface UseEconomicDataReturn {
  data: EconomicData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 한국은행 경제 데이터를 가져오는 훅
 */
export function useEconomicData(): UseEconomicDataReturn {
  const [data, setData] = useState<EconomicData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const economicData = await getAllEconomicData();
      setData(economicData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '경제 데이터를 가져오는데 실패했습니다');
      console.error('ECOS API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
