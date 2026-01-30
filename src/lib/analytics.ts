import { supabase } from '@/lib/supabaseClient';

export async function trackEvent(
  eventType: string,
  payload: Record<string, any> = {}
) {
  // Always ensure session_id exists
  const session_id = payload.session_id || localStorage.getItem('analytics_session');
  if (!session_id) {
    console.warn('No analytics session ID, skipping event');
    return;
  }

  try {
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      session_id,
      path: payload.path || window.location.pathname,
      metadata: payload.metadata || {}
    });

    if (error) throw error;
  } catch (err) {
    console.error('Analytics insert failed:', err);
  }
}
