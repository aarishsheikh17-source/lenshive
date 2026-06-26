
-- 1) photographer_profiles: hide whatsapp_number from anon via column-level grants
REVOKE SELECT ON public.photographer_profiles FROM anon, authenticated;

GRANT SELECT (
  id, user_id, bio, years_experience, instagram_handle, website_url,
  specializations, is_available, available_for_travel, city, country,
  rating, total_reviews, profile_views, is_published, created_at, updated_at
) ON public.photographer_profiles TO anon;

GRANT SELECT ON public.photographer_profiles TO authenticated;

DROP POLICY IF EXISTS "Published photographer profiles are public" ON public.photographer_profiles;

CREATE POLICY "Anon can view published photographer profiles"
  ON public.photographer_profiles FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated can view published or own photographer profile"
  ON public.photographer_profiles FOR SELECT
  TO authenticated
  USING (is_published = true OR auth.uid() = user_id);

-- 2) enquiries: tighten always-true INSERT policy
DROP POLICY IF EXISTS "Anyone can submit an enquiry" ON public.enquiries;

CREATE POLICY "Anon can submit enquiry without client_id"
  ON public.enquiries FOR INSERT
  TO anon
  WITH CHECK (client_id IS NULL);

CREATE POLICY "Authenticated can submit enquiry as themselves"
  ON public.enquiries FOR INSERT
  TO authenticated
  WITH CHECK (client_id IS NULL OR client_id = auth.uid());

-- 3) Remove public SECURITY DEFINER RPC
DROP FUNCTION IF EXISTS public.increment_profile_views(uuid);
