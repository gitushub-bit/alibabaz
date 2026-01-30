// src/hooks/useClickTracking.ts
import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function useClickTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const path = window.location.pathname;
      const elementInfo = {
        tag: target.tagName,
        id: target.id || undefined,
        classes: target.className || undefined,
        text: target.innerText?.slice(0, 100) || undefined
      };

      const session_id = localStorage.getItem('analytics_session');

      trackEvent('click', { session_id, path, element: elementInfo });
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
