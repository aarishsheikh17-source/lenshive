
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (id, full_name, avatar_url, is_verified) ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;

CREATE POLICY "Public can view non-sensitive profile fields"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can view own full profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Authenticated can view non-sensitive profile fields"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);
