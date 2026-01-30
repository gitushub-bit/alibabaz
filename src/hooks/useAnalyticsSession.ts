import { useEffect } from 'react';

export function useAnalyticsSession() {
  useEffect(() => {
    if (!localStorage.getItem('analytics_session')) {
      localStorage.setItem('analytics_session', crypto.randomUUID());
    }
  }, []);
}
