import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('analytics_events')
      .select('event_type, path, created_at')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data }) => setStats(data || []))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Analytics</h1>

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Event</th>
            <th>Path</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((e, i) => (
            <tr key={i}>
              <td>{e.event_type}</td>
              <td>{e.path}</td>
              <td>{new Date(e.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
