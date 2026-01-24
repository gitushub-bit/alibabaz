-- Add RLS policy for admins to insert products via CSV import
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  is_super_admin(auth.uid())
);

-- Add RLS policy for admins to update any product
CREATE POLICY "Admins can update any product"
ON public.products
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  is_super_admin(auth.uid())
);

-- Add RLS policy for admins to delete any product
CREATE POLICY "Admins can delete any product"
ON public.products
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  is_super_admin(auth.uid())
);