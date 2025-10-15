// src/services/sessionService.js
const BASE_URL = 'http://211.44.183.248:8600';

class SessionService {
  constructor() {
    this.sessionId = null;
  }

  async startSession(profile = null) {
    try {
      const response = await fetch(`${BASE_URL}/lineage/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.status}`);
      }

      const data = await response.json();
      this.sessionId = data.sessionId;
      console.log('Session started:', this.sessionId);
      return this.sessionId;
    } catch (error) {
      console.error('Session start error:', error);
      throw error;
    }
  }

  async endSession() {
    if (!this.sessionId) return;

    try {
      await fetch(`${BASE_URL}/lineage/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': this.sessionId,
        },
      });
      console.log('Session ended:', this.sessionId);
      this.sessionId = null;
    } catch (error) {
      console.error('Session end error:', error);
    }
  }

  getSessionHeaders(additionalHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      ...(this.sessionId && { 'X-Session-Id': this.sessionId }),
      ...additionalHeaders,
    };
  }

  hasSession() {
    return !!this.sessionId;
  }
}

export const sessionService = new SessionService();