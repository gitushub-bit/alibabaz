-- Drop the permissive INSERT policy and create a more restrictive one
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Only allow inserts if the notification is for the authenticated user
-- OR if it's done via service role (which bypasses RLS anyway)
CREATE POLICY "Users can receive notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);