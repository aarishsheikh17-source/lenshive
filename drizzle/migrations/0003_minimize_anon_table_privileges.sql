-- Anonymous role should only hold read access (plus anonymous enquiry submission).
REVOKE ALL ON public.profiles, public.photographer_profiles, public.pricing,
  public.portfolio_items, public.reviews, public.saved_photographers FROM anon;
GRANT INSERT ON public.enquiries TO anon;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.enquiries FROM anon;

-- Reads: scoped to the columns/policies meant to be public.
GRANT SELECT ON public.pricing, public.portfolio_items, public.reviews TO anon;
GRANT SELECT (id, full_name, avatar_url, is_verified) ON public.profiles TO anon;
GRANT SELECT (
  id, user_id, bio, years_experience, instagram_handle, website_url,
  specializations, is_available, available_for_travel, city, country,
  rating, total_reviews, profile_views, is_published, created_at, updated_at
) ON public.photographer_profiles TO anon;