// src/hooks/useAnalyticsSession.ts
import { useEffect } from 'react';

export function useAnalyticsSession() {
  useEffect(() => {
    // Only generate session_id if missing
    if (!localStorage.getItem('analytics_session')) {
      const sessionId = crypto?.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

      localStorage.setItem('analytics_session', sessionId);
    }
  }, []);
}
