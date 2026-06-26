
REVOKE SELECT ON public.profiles FROM authenticated;
GRANT SELECT (id, full_name, avatar_url, is_verified) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;
