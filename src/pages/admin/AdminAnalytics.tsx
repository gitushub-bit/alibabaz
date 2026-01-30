import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


interface AnalyticsEvent {
  event_type: string;
  path: string | null;
  created_at: string;
}

export default function AdminAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type, path, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setEvents(data);
    } else {
      console.error('Analytics fetch error:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          User behavior and interaction logs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No analytics data yet
            </p>
          ) : (
            <div className="space-y-2">
              {events.map((e, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm border-b py-2 last:border-0"
                >
                  <span className="font-medium">{e.event_type}</span>
                  <span className="text-muted-foreground">
                    {e.path || '-'}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(e.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
