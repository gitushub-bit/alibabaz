-- Create a function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Update RLS policies for user_roles to allow super_admin full access
DROP POLICY IF EXISTS "Super admins can manage all roles" ON public.user_roles;
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_super_admin(auth.uid()));

-- Update site_settings policies for super_admin
DROP POLICY IF EXISTS "Super admins can manage site settings" ON public.site_settings;
CREATE POLICY "Super admins can manage site settings"
ON public.site_settings
FOR ALL
USING (is_super_admin(auth.uid()));

-- Create deals table for managing top deals from admin
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  image text,
  price numeric,
  original_price numeric,
  discount integer,
  moq integer DEFAULT 1,
  supplier text,
  is_verified boolean DEFAULT false,
  is_flash_deal boolean DEFAULT false,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policies for deals
CREATE POLICY "Deals are viewable by everyone"
ON public.deals
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage deals"
ON public.deals
FOR ALL
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- Create featured_items table for dynamic homepage content
CREATE TABLE IF NOT EXISTS public.featured_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL,
  item_id uuid,
  title text NOT NULL,
  image text,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on featured_items
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;

-- Policies for featured_items
CREATE POLICY "Featured items are viewable by everyone"
ON public.featured_items
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage featured items"
ON public.featured_items
FOR ALL
USING (has_role(auth.uid(), 'admin') OR is_super_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_featured_items_updated_at
BEFORE UPDATE ON public.featured_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample deals
INSERT INTO public.deals (title, image, price, original_price, discount, moq, supplier, is_verified, is_flash_deal) VALUES
('Industrial CNC Milling Machine High Precision', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop', 15000, 22000, 32, 1, 'Jinan CNC Machinery Co.', true, true),
('Wireless Bluetooth Headphones Pro ANC', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', 45, 89, 49, 50, 'Shenzhen Audio Tech Ltd.', true, true),
('Premium Leather Office Sofa Set 3-Seater', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop', 450, 680, 34, 5, 'Foshan Furniture Manufacturing', true, false),
('Ergonomic Gaming Chair RGB LED Pro', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop', 189, 299, 37, 10, 'Gaming Gear Factory', false, true),
('Smart Watch Fitness Tracker Multi-Sport', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', 12, 35, 66, 100, 'Shenzhen Smart Devices', true, true),
('Cotton T-Shirt Blank Premium 180gsm', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', 2.50, 5.00, 50, 500, 'Guangzhou Textile Co.', true, false),
('Electric Forklift 2.5 Ton Lithium Battery', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop', 8500, 12000, 29, 1, 'Hangzhou Machinery Ltd.', true, true),
('Professional Makeup Brush Set 32pcs', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', 8, 25, 68, 50, 'Beauty Tools Factory', false, true);

-- Insert sample featured items for suppliers
INSERT INTO public.featured_items (section, title, image, metadata) VALUES
('suppliers', 'Shenzhen Electronics Co., Ltd', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=200&fit=crop', '{"category": "Electronics & Gadgets", "years": 8, "location": "China", "verified": true, "responseRate": "98%"}'),
('suppliers', 'Guangzhou Furniture Factory', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=200&fit=crop', '{"category": "Home & Furniture", "years": 12, "location": "China", "verified": true, "responseRate": "95%"}'),
('suppliers', 'Mumbai Textile Industries', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=200&fit=crop', '{"category": "Apparel & Textiles", "years": 15, "location": "India", "verified": true, "responseRate": "92%"}'),
('suppliers', 'Tokyo Tech Solutions', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop', '{"category": "Technology & Gadgets", "years": 10, "location": "Japan", "verified": true, "responseRate": "99%"}');

-- Insert sample featured items for trending products
INSERT INTO public.featured_items (section, title, image, metadata) VALUES
('trending', 'Smart Watch Ultra 2024', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop', '{"priceRange": "$25 - $45", "moq": "50 pieces", "supplier": "TechPro Ltd", "verified": true}'),
('trending', 'Sports Running Shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', '{"priceRange": "$12 - $28", "moq": "100 pairs", "supplier": "Footwear Co", "verified": true}'),
('trending', 'Polaroid Camera Vintage', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop', '{"priceRange": "$35 - $55", "moq": "20 units", "supplier": "CameraWorld", "verified": false}'),
('trending', 'Smart Watch Band', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', '{"priceRange": "$2 - $8", "moq": "200 pieces", "supplier": "AccessoryHub", "verified": true}'),
('trending', 'Skincare Product Set', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop', '{"priceRange": "$15 - $35", "moq": "50 sets", "supplier": "BeautySource", "verified": true}'),
('trending', 'Wireless Earbuds Pro', 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop', '{"priceRange": "$8 - $20", "moq": "100 pieces", "supplier": "AudioTech", "verified": true}');