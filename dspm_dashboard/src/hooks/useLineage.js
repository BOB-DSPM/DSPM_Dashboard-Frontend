import { useState, useCallback } from 'react';

const LINEAGE_API = 'https://3q28fda8dc.execute-api.ap-northeast-2.amazonaws.com/prod/';

export const useLineage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lineageData, setLineageData] = useState(null);

  const loadLineage = useCallback(async (pipelineName, region = 'ap-northeast-2') => {
    if (!pipelineName || !pipelineName.trim()) {
      setError('파이프라인 이름을 입력하세요');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${LINEAGE_API}/lineage?pipeline=${pipelineName}&includeLatestExec=true&region=${region}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setLineageData(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch lineage data:', err);
      setError(err.message || '데이터를 불러올 수 없습니다');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { lineageData, loading, error, loadLineage };
};