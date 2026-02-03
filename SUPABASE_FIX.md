# Supabase Configuration Fixes

## 1. Fix Google Sign-In (400 Bad Request Error)

The error `redirect_to=http%3A%2F%2Flocalhost%3A8080%2F` indicates that your application is running on port **8080**, but Supabase likely expects port **5173**.

**Steps to Fix:**

1.  Go to your **Supabase Dashboard**.
2.  Navigate to **Authentication** > **URL Configuration**.
3.  Under **Redirect URLs**, add the following URL:
    *   `http://localhost:8080/`
4.  Click **Save**.
5.  Also, verify your **Google Cloud Console** configuration:
    *   Go to **APIs & Services** > **Credentials**.
    *   Edit your OAuth 2.0 Client ID.
    *   Ensure `http://localhost:8080` and `http://localhost:8080/auth` are in the **Authorized JavaScript origins** if required (usually just origin).
    *   Ensure `https://<your-project-ref>.supabase.co/auth/v1/callback` is in **Authorized redirect URIs**.

## 2. Fix Analytics 401 Unauthorized Error

Refers to: `POST .../analytics_events 401 (Unauthorized)`

The `analytics_events` table likely exists but is missing Row Level Security (RLS) policies to allow users (even anonymous ones) to insert data.

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Create the table if it doesn't exist (to be safe)
create table if not exists public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_type text not null,
  session_id text not null,
  path text,
  metadata jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Policy to allow ANYONE (anon + authenticated) to insert analytics
create policy "Enable insert for all users"
on public.analytics_events
for insert
to public
with check (true);

-- Policy to allow admins to view (optional, adjust as needed)
create policy "Enable select for admins"
on public.analytics_events
for select
to authenticated
using (
  exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role in ('admin', 'super_admin')
  )
);
```

## 3. General Cleanup

We have consolidated the Supabase client usage to avoid "Multiple GoTrueClient instances" warnings.
*   Deleted `src/lib/supabaseClient.ts`.
*   Updated `src/lib/analytics.ts` to use `@/integrations/supabase/client`.

No further action is needed for this cleanup.
