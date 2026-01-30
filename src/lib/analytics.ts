// src/lib/analytics.ts
import { supabase } from '@/lib/supabaseClient';

export async function trackEvent(
  eventType: string,
  payload: Record<string, any>
) {
  const session_id = payload.session_id || localStorage.getItem('analytics_session');

  if (!session_id) {
    console.warn('No analytics session id set, skipping event');
    return;
  }

  try {
    await supabase.from('analytics_events').insert({
      event_type: eventType,
      session_id,
      ...payload
    });
  } catch (err) {
    console.error('Analytics insert failed:', err);
  }
}
