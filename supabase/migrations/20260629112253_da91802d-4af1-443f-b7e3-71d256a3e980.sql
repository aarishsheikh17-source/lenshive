
-- 1) profiles: prevent self-verify. Revoke UPDATE and re-grant only safe columns.
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, avatar_url, city, country, updated_at) ON public.profiles TO authenticated;

-- 2) photographer_profiles: prevent direct rating/views manipulation.
REVOKE UPDATE ON public.photographer_profiles FROM authenticated;
GRANT UPDATE (
  bio, years_experience, instagram_handle, website_url, whatsapp_number,
  specializations, is_available, available_for_travel, city, country,
  is_published, updated_at
) ON public.photographer_profiles TO authenticated;

-- 3) pricing: restrict public reads to published photographers only.
DROP POLICY IF EXISTS "Pricing is public" ON public.pricing;
CREATE POLICY "Pricing is public for published photographers"
ON public.pricing
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.photographer_profiles p
    WHERE p.id = pricing.photographer_id AND p.is_published = true
  )
);

-- 4) portfolio_items: restrict public reads to published photographers only.
DROP POLICY IF EXISTS "Portfolio is public" ON public.portfolio_items;
CREATE POLICY "Portfolio is public for published photographers"
ON public.portfolio_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.photographer_profiles p
    WHERE p.id = portfolio_items.photographer_id AND p.is_published = true
  )
);
