// src/services/lineageApi.js
import { sessionService } from './sessionService';

const BASE_URL = 'http://211.44.183.248:8600';

export const lineageApi = {
  // SageMaker Overview (리전별 개요)
  async getOverview(regions = 'ap-northeast-2', includeLatestExec = true) {
    const url = `${BASE_URL}/lineage/sagemaker/overview?regions=${regions}&includeLatestExec=${includeLatestExec}`;
    
    const response = await fetch(url, {
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch overview: ${response.status}`);
    }

    return await response.json();
  },

  // 특정 파이프라인 그래프
  async getLineage(pipeline, region = 'ap-northeast-2', includeLatestExec = true) {
    const url = new URL(`${BASE_URL}/lineage/lineage`);
    url.searchParams.set('pipeline', pipeline);
    url.searchParams.set('region', region);
    url.searchParams.set('includeLatestExec', String(includeLatestExec));

    const response = await fetch(url.toString(), {
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lineage: ${response.status}`);
    }

    return await response.json();
  },

  // 도메인 일괄 조회
  async getLineageByDomain(region, domain, includeLatestExec = true) {
    const url = `${BASE_URL}/lineage/lineage/by-domain?region=${region}&domain=${domain}&includeLatestExec=${includeLatestExec}`;
    
    const response = await fetch(url, {
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch lineage by domain: ${response.status}`);
    }

    return await response.json();
  },
};