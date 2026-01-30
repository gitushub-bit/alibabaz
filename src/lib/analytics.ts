import { supabase } from '@/lib/supabaseClient'

export async function trackEvent(
  eventType: string,
  payload: Record<string, any>
) {
  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      ...payload
    })
  } catch (err) {
    console.error('Analytics error', err)
  }
}
