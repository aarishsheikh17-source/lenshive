DROP POLICY IF EXISTS "Reviews are public" ON public.reviews;

CREATE POLICY "Reviews of published photographers are public"
ON public.reviews
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.photographer_profiles p
    WHERE p.id = reviews.photographer_id
      AND p.is_published = true
  )
);

CREATE POLICY "Clients can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Rating aggregates run as a trigger fired by whoever writes the review;
-- SECURITY DEFINER keeps the recalculation working for every writer.
CREATE OR REPLACE FUNCTION public.recalculate_photographer_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.photographer_id, OLD.photographer_id);
  UPDATE public.photographer_profiles
  SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM public.reviews WHERE photographer_id = pid), 0),
      total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE photographer_id = pid)
  WHERE id = pid;
  RETURN NULL;
END;
$function$;