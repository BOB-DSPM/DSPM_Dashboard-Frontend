// src/hooks/useLineage.js
import { useState, useCallback } from 'react';

const LINEAGE_API = 'http://192.168.0.10:8300';

export const useLineage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lineageData, setLineageData] = useState(null);
  const [pipelines, setPipelines] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loadingPipelines, setLoadingPipelines] = useState(false);

  // 파이프라인 목록 조회 (Catalog 사용)
  const loadPipelines = useCallback(async (regions = 'ap-northeast-2') => {
    setLoadingPipelines(true);
    setError(null);

    try {
      const url = `${LINEAGE_API}/sagemaker/catalog?regions=${regions}`;
      
      console.log('Fetching pipelines from:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`API error: ${response.status} ${response.statusText}`);
        setPipelines([]);
        setDomains([]);
        return [];
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // 파이프라인 목록 추출
      const pipelineList = [];
      if (data.regions && Array.isArray(data.regions)) {
        data.regions.forEach(regionData => {
          if (regionData.pipelines && Array.isArray(regionData.pipelines)) {
            regionData.pipelines.forEach(pipe => {
              pipelineList.push({
                name: pipe.name,
                arn: pipe.arn,
                region: regionData.region,
                lastModifiedTime: pipe.lastModifiedTime,
                tags: pipe.tags || {},
                matchedDomain: pipe.matchedDomain,
              });
            });
          }
        });
      }
      
      // 파이프라인에서 실제 사용되는 도메인 ID 추출
      const domainIdSet = new Set();
      pipelineList.forEach(pipe => {
        if (pipe.tags && pipe.tags['sagemaker:domain-arn']) {
          const match = pipe.tags['sagemaker:domain-arn'].match(/domain\/(d-[a-z0-9]+)/);
          if (match) {
            domainIdSet.add(match[1]);
          }
        }
      });
      
      // 도메인 목록 생성 (ID만 표시)
      const domainList = Array.from(domainIdSet).map(domainId => ({
        id: domainId,
        name: domainId,  // 이름 대신 ID 표시
        region: regions,
      }));
      
      setDomains(domainList);
      
      console.log('Extracted pipeline list:', pipelineList);
      console.log('Extracted domain list:', domainList);
      setPipelines(pipelineList);
      return pipelineList;
    } catch (err) {
      console.warn('Backend API not available:', err.message);
      setPipelines([]);
      setDomains([]);
      return [];
    } finally {
      setLoadingPipelines(false);
    }
  }, []);

  // 특정 파이프라인의 lineage 조회
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
        console.warn(`API error: ${response.status} ${response.statusText}`);
        setLineageData(null);
        return null;
      }
      
      const data = await response.json();
      setLineageData(data);
      return data;
    } catch (err) {
      console.warn('Backend API not available:', err.message);
      setLineageData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { 
    lineageData, 
    loading, 
    error, 
    loadLineage,
    pipelines,
    domains,
    loadingPipelines,
    loadPipelines
  };
};