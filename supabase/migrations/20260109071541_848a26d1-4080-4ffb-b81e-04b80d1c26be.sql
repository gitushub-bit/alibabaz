-- Create site_settings table for admin configuration
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage site settings
CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can read certain settings (like telegram enabled status)
CREATE POLICY "Everyone can read public settings" ON public.site_settings
  FOR SELECT USING (key NOT LIKE '%_api_key%' AND key NOT LIKE '%_token%' AND key NOT LIKE '%_secret%');

-- Create notifications table for real-time notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Create payment_transactions table for demo payment tracking
CREATE TABLE public.payment_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id),
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  card_last_four text,
  card_brand text,
  status text DEFAULT 'pending',
  otp_verified boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions" ON public.payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own transactions
CREATE POLICY "Users can create transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending transactions
CREATE POLICY "Users can update own pending transactions" ON public.payment_transactions
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON public.payment_transactions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Insert default telegram settings (empty, admin will configure)
INSERT INTO public.site_settings (key, value) VALUES 
  ('telegram_bot_token', '""'),
  ('telegram_chat_id', '""'),
  ('telegram_notifications_enabled', 'false'),
  ('payment_notifications_enabled', 'true');