-- 1. allow accepted bookings
ALTER TABLE public.enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_status_check
  CHECK (status = ANY (ARRAY['unread','read','replied','accepted','closed']));

-- 2. tighten profile row visibility
DROP POLICY IF EXISTS "Public can view non-sensitive profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view non-sensitive profile fields" ON public.profiles;

CREATE POLICY "Public can view published photographer and reviewer profiles"
ON public.profiles FOR SELECT TO anon
USING (
  EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.user_id = profiles.id AND p.is_published)
  OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.client_id = profiles.id)
);

CREATE POLICY "Users can view own profile and visible profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.photographer_profiles p WHERE p.user_id = profiles.id AND p.is_published)
  OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.client_id = profiles.id)
);

-- 3. own full profile (incl. email/phone/city) via security definer helper
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE (
  id uuid, full_name text, email text, phone text, city text, country text,
  avatar_url text, user_type text, is_verified boolean
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.full_name, p.email, p.phone, p.city, p.country, p.avatar_url, p.user_type, p.is_verified
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- 4. portfolio files readable only for published photographers (or their owner)
DROP POLICY IF EXISTS "Anyone can view portfolio files" ON storage.objects;
CREATE POLICY "Portfolio files of published photographers are viewable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'portfolios'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR EXISTS (
      SELECT 1 FROM public.photographer_profiles p
      WHERE p.user_id::text = (storage.foldername(name))[1] AND p.is_published
    )
  )
);