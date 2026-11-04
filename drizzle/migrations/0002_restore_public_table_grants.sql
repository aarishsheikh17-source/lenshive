-- Restore Data API grants (they were missing entirely), keeping the hardened column scopes.

-- profiles: public sees only safe display columns; owners manage safe columns.
GRANT SELECT (id, full_name, avatar_url, is_verified) ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url, city, country, updated_at) ON public.profiles TO authenticated;

-- photographer_profiles: public reads exclude whatsapp_number.
GRANT SELECT (
  id, user_id, bio, years_experience, instagram_handle, website_url,
  specializations, is_available, available_for_travel, city, country,
  rating, total_reviews, profile_views, is_published, created_at, updated_at
) ON public.photographer_profiles TO anon;
GRANT SELECT ON public.photographer_profiles TO authenticated;
GRANT INSERT ON public.photographer_profiles TO authenticated;
GRANT UPDATE (
  bio, years_experience, instagram_handle, website_url, whatsapp_number,
  specializations, is_available, available_for_travel, city, country,
  is_published, updated_at
) ON public.photographer_profiles TO authenticated;
GRANT DELETE ON public.photographer_profiles TO authenticated;

GRANT SELECT ON public.pricing TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pricing TO authenticated;

GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portfolio_items TO authenticated;

GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT ON public.enquiries TO authenticated;
GRANT UPDATE (status, photographer_reply, replied_at) ON public.enquiries TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.saved_photographers TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;