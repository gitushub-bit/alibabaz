-- Add super_admin to app_role enum (this needs to be committed first)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';