// 앱 전체에서 Response.json()을 안전하게 바꿉니다.
(function patchSafeJson() {
  const origJson = Response.prototype.json;

  Response.prototype.json = async function safeJsonPatched() {
    try {
      // 이미 body 사용된 경우 원본으로 시도 (읽으면 에러지만 최대한 호환)
      if (this.bodyUsed) {
        return await origJson.call(this);
      }

      const ct = (this.headers.get('content-type') || '').toLowerCase();
      const status = this.status;

      // 내용 읽기 (한 번만 가능)
      const text = await this.text();
      const trimmed = text.trim();

      // 204/205 또는 진짜 빈 바디 → null
      if (status === 204 || status === 205 || !trimmed) {
        return null;
      }

      // NDJSON 또는 줄 단위가 의심되면 첫 줄만 파싱 (나머지는 호출부 스트림 처리)
      if (ct.includes('application/x-ndjson') || trimmed.includes('\n{')) {
        const first = trimmed.split('\n').find(Boolean) || '';
        return JSON.parse(first);
      }

      // 보통 JSON
      return JSON.parse(trimmed);
    } catch (e) {
      // 마지막 방어: 원본 시도(여기도 실패하면 실제 원인 그대로 throw)
      return await origJson.call(this);
    }
  };
})();
