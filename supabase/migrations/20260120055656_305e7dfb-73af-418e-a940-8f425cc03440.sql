-- Add footer_settings to site_settings if not exists
-- Admin can manage footer content dynamically

-- Insert default footer settings
INSERT INTO public.site_settings (key, value)
VALUES (
  'footer_settings',
  '{
    "sections": [
      {
        "id": "get-to-know",
        "title": "Get to Know Us",
        "links": [
          { "label": "About Us", "href": "/about" },
          { "label": "Careers", "href": "/careers" },
          { "label": "Press Center", "href": "/press" },
          { "label": "Blog", "href": "/blog" }
        ]
      },
      {
        "id": "trade",
        "title": "Trade Services",
        "links": [
          { "label": "Trade Assurance", "href": "/trade-assurance" },
          { "label": "Buyer Protection", "href": "/buyer-protection" },
          { "label": "Logistics Services", "href": "/logistics" },
          { "label": "RFQ Marketplace", "href": "/buyer/rfqs" }
        ]
      },
      {
        "id": "sell",
        "title": "Sell on Site",
        "links": [
          { "label": "Start Selling", "href": "/seller" },
          { "label": "Seller Central", "href": "/seller" },
          { "label": "Become a Supplier", "href": "/auth?role=seller" },
          { "label": "Supplier Membership", "href": "/membership" }
        ]
      },
      {
        "id": "buy",
        "title": "Buy on Site",
        "links": [
          { "label": "Request for Quotation", "href": "/buyer/rfqs/new" },
          { "label": "Buyer Central", "href": "/buyer" },
          { "label": "Order Tracking", "href": "/orders" },
          { "label": "Payment Methods", "href": "/payment-methods" }
        ]
      },
      {
        "id": "help",
        "title": "Help & Support",
        "links": [
          { "label": "Help Center", "href": "/help" },
          { "label": "Contact Us", "href": "/contact" },
          { "label": "Report Abuse", "href": "/report" },
          { "label": "FAQs", "href": "/faqs" }
        ]
      }
    ],
    "contact": {
      "email": "support@example.com",
      "phone": "+1 (800) 123-4567",
      "address": "Global Headquarters"
    },
    "socialLinks": [
      { "platform": "facebook", "href": "#", "label": "Facebook" },
      { "platform": "twitter", "href": "#", "label": "Twitter" },
      { "platform": "instagram", "href": "#", "label": "Instagram" },
      { "platform": "linkedin", "href": "#", "label": "LinkedIn" },
      { "platform": "youtube", "href": "#", "label": "YouTube" }
    ],
    "trustBadges": [
      { "icon": "Shield", "label": "Buyer Protection" },
      { "icon": "Truck", "label": "Fast Shipping" },
      { "icon": "CreditCard", "label": "Secure Payments" },
      { "icon": "Headphones", "label": "24/7 Support" }
    ],
    "legal": {
      "copyright": "B2B Marketplace. All rights reserved.",
      "termsLink": "/terms",
      "privacyLink": "/privacy",
      "cookiesLink": "/cookies"
    },
    "description": "The leading B2B ecommerce platform connecting buyers and suppliers worldwide."
  }'::jsonb
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- Add payment_override_log table for admin purchase overrides
CREATE TABLE IF NOT EXISTS public.payment_override_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_override_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and insert override logs
CREATE POLICY "Admins can view override logs"
  ON public.payment_override_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can create override logs"
  ON public.payment_override_logs
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));