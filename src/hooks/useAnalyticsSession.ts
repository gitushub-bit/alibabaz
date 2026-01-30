import { useEffect } from 'react'
import { v4 as uuid } from 'uuid'

export function useAnalyticsSession() {
  useEffect(() => {
    if (!localStorage.getItem('analytics_session')) {
      localStorage.setItem('analytics_session', uuid())
    }
  }, [])
}
