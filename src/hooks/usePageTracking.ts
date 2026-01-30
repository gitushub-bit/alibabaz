import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'
import { supabase } from '@/lib/supabaseClient'

export function usePageTracking() {
  useEffect(() => {
    const session_id = localStorage.getItem('analytics_session')
    const path = window.location.pathname
    const started = Date.now()

    trackEvent('page_view', { session_id, path })

    return () => {
      trackEvent('exit', {
        session_id,
        path,
        metadata: {
          time_spent_ms: Date.now() - started
        }
      })
    }
  }, [])
}
