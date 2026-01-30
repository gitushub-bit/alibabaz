import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function usePageTracking() {
  useEffect(() => {
    const start = Date.now();
    const path = window.location.pathname;

    // Track page view
    trackEvent('page_view', { path });

    return () => {
      trackEvent('exit', {
        path,
        metadata: { time_spent_ms: Date.now() - start }
      });
    };
  }, []);
}
