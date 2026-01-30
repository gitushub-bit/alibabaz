import { supabase } from '@/lib/supabaseClient'

type AnalyticsPayload = {
  session_id: string | null
  path?: string
  metadata?: Record<string, any>
}

export async function trackEvent(
  eventType: string,
  payload: AnalyticsPayload
) {
  // 🔒 Hard guard: never write invalid rows
  if (!payload.session_id) {
    console.warn('Analytics skipped: missing session_id', eventType)
    return
  }

  const { session_id, path, metadata } = payload

  const { error } = await supabase
    .from('analytics_events')
    .insert({
      session_id,          // ✅ explicitly set
      event_type: eventType,
      path: path ?? null,
      metadata: metadata ?? null,
    })

  if (error) {
    console.error('Analytics insert failed:', error)
  }
}

