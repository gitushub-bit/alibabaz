// src/hooks/usePageTracking.ts
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function usePageTracking() {
  useEffect(() => {
    const session_id = localStorage.getItem('analytics_session');
    const path = window.location.pathname;
    const started = Date.now();

    // Track page view
    trackEvent('page_view', { session_id, path });

    // Track exit / time spent
    return () => {
      trackEvent('exit', {
        session_id,
        path,
        metadata: {
          time_spent_ms: Date.now() - started
        }
      });
    };
  }, []);
}

