
-- Fix reviews duplicate INSERT policy
DROP POLICY IF EXISTS "Clients can write reviews" ON public.reviews;

-- Fix enquiries: restrict which columns photographers can update
REVOKE UPDATE ON public.enquiries FROM authenticated;
GRANT UPDATE (status, photographer_reply, replied_at) ON public.enquiries TO authenticated;
