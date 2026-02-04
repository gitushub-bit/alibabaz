-- Add product_id and buyer_id to reviews for public access and better filtering
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Backfill data from orders table
UPDATE public.reviews r
SET 
  product_id = o.product_id,
  buyer_id = o.buyer_id
FROM public.orders o
WHERE r.order_id = o.id;

-- Make them NOT NULL if possible (optional, but good for integrity)
-- ALTER TABLE public.reviews ALTER COLUMN product_id SET NOT NULL;

-- Update RLS policies to use these new columns
DROP POLICY IF EXISTS "Order buyers can create reviews" ON public.reviews;
CREATE POLICY "Order buyers can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = buyer_id);

-- Ensure everyone can still view reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (true);
