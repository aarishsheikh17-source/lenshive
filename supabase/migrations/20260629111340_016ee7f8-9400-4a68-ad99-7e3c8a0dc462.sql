
-- Remove duplicate reviews (keep earliest per client/photographer)
DELETE FROM public.reviews r
USING public.reviews r2
WHERE r.photographer_id = r2.photographer_id
  AND r.client_id = r2.client_id
  AND r.created_at > r2.created_at;

-- Remove any existing self-reviews
DELETE FROM public.reviews r
USING public.photographer_profiles p
WHERE r.photographer_id = p.id AND p.user_id = r.client_id;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_unique_client_photographer UNIQUE (photographer_id, client_id);

DROP POLICY IF EXISTS "Clients can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated can create reviews" ON public.reviews;

CREATE POLICY "Clients can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = client_id
  AND photographer_id NOT IN (
    SELECT id FROM public.photographer_profiles WHERE user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'client'
  )
);

-- Recalculate ratings after cleanup
UPDATE public.photographer_profiles pp
SET rating = COALESCE(sub.avg_rating, 0),
    total_reviews = COALESCE(sub.cnt, 0)
FROM (
  SELECT photographer_id,
         ROUND(AVG(rating)::numeric, 1) AS avg_rating,
         COUNT(*) AS cnt
  FROM public.reviews
  GROUP BY photographer_id
) sub
WHERE pp.id = sub.photographer_id;
