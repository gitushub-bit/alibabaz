import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function useClickTracking() {
  useEffect(() => {
    const session_id = localStorage.getItem('analytics_session')

    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      trackEvent('click', {
        session_id,
        path: window.location.pathname,
        element: el.tagName,
        metadata: {
          id: el.id,
          class: el.className,
          text: el.innerText?.slice(0, 100)
        }
      })
    }

    let maxScroll = 0
    const onScroll = () => {
      const scrolled =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight
      maxScroll = Math.max(maxScroll, Math.round(scrolled * 100))
    }

    window.addEventListener('click', onClick)
    window.addEventListener('scroll', onScroll)

    return () => {
      trackEvent('scroll', {
        session_id,
        path: window.location.pathname,
        metadata: { max_scroll_percent: maxScroll }
      })

      window.removeEventListener('click', onClick)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
}
