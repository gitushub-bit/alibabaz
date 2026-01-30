import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function useClickTracking() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        trackEvent('click', {
          path: window.location.pathname,
          metadata: { tag: target.tagName, id: target.id || null, class: target.className || null }
        });
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);
}
