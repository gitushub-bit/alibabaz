-- Add AI-generated content columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ai_description text,
ADD COLUMN IF NOT EXISTS ai_features text[],
ADD COLUMN IF NOT EXISTS ai_specifications jsonb,
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS meta_description text,
ADD COLUMN IF NOT EXISTS ai_generated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ai_generation_version integer DEFAULT 0;

-- Add address fields to profiles for user profile page
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state_province text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text;