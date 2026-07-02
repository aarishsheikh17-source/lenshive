GRANT SELECT (
  id, user_id, bio, years_experience, instagram_handle, website_url,
  specializations, is_available, available_for_travel, city, country,
  rating, total_reviews, profile_views, is_published, created_at, updated_at
) ON public.photographer_profiles TO anon;

GRANT SELECT ON public.photographer_profiles TO authenticated;

GRANT SELECT ON public.pricing TO anon, authenticated;
GRANT SELECT ON public.portfolio_items TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
