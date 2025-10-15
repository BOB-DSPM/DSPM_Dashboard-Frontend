// src/services/complianceApi.js
import { sessionService } from './sessionService';

const BASE_URL = 'http://211.44.183.248:8600';

export const complianceApi = {
  // 프레임워크 전체 감사 (배치)
  async auditAll(framework) {
    const response = await fetch(`${BASE_URL}/compliance/audit/${framework}/_all`, {
      method: 'POST',
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Audit failed: ${response.status}`);
    }

    return await response.json();
  },

  // 프레임워크 전체 감사 (스트리밍)
  async auditAllStreaming(framework, onProgress) {
    const response = await fetch(`${BASE_URL}/compliance/audit/${framework}/_all?stream=true`, {
      method: 'POST',
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Audit failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let leftover = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = leftover + decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      leftover = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const evt = JSON.parse(line);
          if (onProgress) {
            onProgress(evt);
          }
        } catch (error) {
          console.error('Failed to parse line:', line, error);
        }
      }
    }

    if (leftover.trim()) {
      try {
        const evt = JSON.parse(leftover);
        if (onProgress) {
          onProgress(evt);
        }
      } catch (error) {
        console.error('Failed to parse leftover:', leftover, error);
      }
    }
  },

  // 특정 요구사항 감사
  async auditRequirement(framework, requirementId) {
    const response = await fetch(`${BASE_URL}/compliance/audit/${framework}/${requirementId}`, {
      method: 'POST',
      headers: sessionService.getSessionHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Audit failed: ${response.status}`);
    }

    return await response.json();
  },
};