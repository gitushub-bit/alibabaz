-- Create industry_hub_products table for dynamic global industry hubs
CREATE TABLE public.industry_hub_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  country_flag TEXT NOT NULL,
  specialty TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  price TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast country lookups
CREATE INDEX idx_industry_hub_products_country ON public.industry_hub_products(country);

-- Enable RLS
ALTER TABLE public.industry_hub_products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Industry hub products are viewable by everyone"
ON public.industry_hub_products
FOR SELECT
USING (is_active = true);

-- Admins can manage all industry hub products
CREATE POLICY "Admins can manage industry hub products"
ON public.industry_hub_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR is_super_admin(auth.uid()));

-- Insert sample data based on existing hardcoded data
INSERT INTO public.industry_hub_products (country, country_flag, specialty, title, image, price, sort_order) VALUES
-- China
('China', '🇨🇳', 'Electronics & Manufacturing', 'Wireless Earbuds', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', '$5.99', 1),
('China', '🇨🇳', 'Electronics & Manufacturing', 'Smart PCB Board', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop', '$2.50', 2),
('China', '🇨🇳', 'Electronics & Manufacturing', 'Smart Watch', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&h=200&fit=crop', '$12.00', 3),
-- Indonesia
('Indonesia', '🇮🇩', 'Furniture & Rattan', 'Rattan Sofa Set', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop', '$450', 1),
('Indonesia', '🇮🇩', 'Furniture & Rattan', 'Teak Wood Chair', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop', '$85', 2),
('Indonesia', '🇮🇩', 'Furniture & Rattan', 'Bamboo Furniture', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=200&h=200&fit=crop', '$120', 3),
-- Japan
('Japan', '🇯🇵', 'Food & Technology', 'Matcha Powder', 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&h=200&fit=crop', '$25', 1),
('Japan', '🇯🇵', 'Food & Technology', 'Japanese Rice', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=200&h=200&fit=crop', '$18', 2),
('Japan', '🇯🇵', 'Food & Technology', 'Electronics Parts', 'https://images.unsplash.com/photo-1580910051074-3eb694886f8b?w=200&h=200&fit=crop', '$8.50', 3),
-- India
('India', '🇮🇳', 'Textiles & Spices', 'Silk Fabric', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', '$15/m', 1),
('India', '🇮🇳', 'Textiles & Spices', 'Spice Collection', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&h=200&fit=crop', '$12', 2),
('India', '🇮🇳', 'Textiles & Spices', 'Cotton Textiles', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&h=200&fit=crop', '$8/m', 3),
-- Germany
('Germany', '🇩🇪', 'Machinery & Auto Parts', 'CNC Machine', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', '$15,000', 1),
('Germany', '🇩🇪', 'Machinery & Auto Parts', 'Auto Parts', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200&h=200&fit=crop', '$120', 2),
('Germany', '🇩🇪', 'Machinery & Auto Parts', 'Industrial Bearings', 'https://images.unsplash.com/photo-1504222490345-c075b6008014?w=200&h=200&fit=crop', '$45', 3),
-- Vietnam
('Vietnam', '🇻🇳', 'Apparel & Coffee', 'Cotton T-Shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop', '$2.50', 1),
('Vietnam', '🇻🇳', 'Apparel & Coffee', 'Robusta Coffee', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop', '$8/kg', 2),
('Vietnam', '🇻🇳', 'Apparel & Coffee', 'Garments', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&h=200&fit=crop', '$5.00', 3),
-- Turkey
('Turkey', '🇹🇷', 'Textiles & Ceramics', 'Turkish Towels', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=200&h=200&fit=crop', '$12', 1),
('Turkey', '🇹🇷', 'Textiles & Ceramics', 'Ceramic Tiles', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&h=200&fit=crop', '$25/m²', 2),
('Turkey', '🇹🇷', 'Textiles & Ceramics', 'Leather Goods', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop', '$45', 3),
-- South Korea
('South Korea', '🇰🇷', 'Beauty & Electronics', 'K-Beauty Set', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop', '$28', 1),
('South Korea', '🇰🇷', 'Beauty & Electronics', 'Skincare', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&h=200&fit=crop', '$15', 2),
('South Korea', '🇰🇷', 'Beauty & Electronics', 'Phone Accessories', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop', '$8', 3),
-- Brazil
('Brazil', '🇧🇷', 'Agriculture & Coffee', 'Arabica Coffee', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=200&h=200&fit=crop', '$12/kg', 1),
('Brazil', '🇧🇷', 'Agriculture & Coffee', 'Organic Fruits', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=200&fit=crop', '$8', 2),
('Brazil', '🇧🇷', 'Agriculture & Coffee', 'Leather Shoes', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&h=200&fit=crop', '$35', 3),
-- Thailand
('Thailand', '🇹🇭', 'Food & Rubber', 'Thai Rice', 'https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=200&h=200&fit=crop', '$15/kg', 1),
('Thailand', '🇹🇭', 'Food & Rubber', 'Natural Rubber', 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=200&h=200&fit=crop', '$2.50/kg', 2),
('Thailand', '🇹🇭', 'Food & Rubber', 'Coconut Products', 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=200&h=200&fit=crop', '$6', 3);

-- Add trigger for updated_at
CREATE TRIGGER update_industry_hub_products_updated_at
BEFORE UPDATE ON public.industry_hub_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();