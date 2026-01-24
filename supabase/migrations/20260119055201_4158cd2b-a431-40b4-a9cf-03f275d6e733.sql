-- Drop the status check constraint that's blocking orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Also ensure any status value is accepted
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'pending';