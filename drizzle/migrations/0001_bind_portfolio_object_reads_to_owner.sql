DROP POLICY IF EXISTS "Portfolio files of published photographers are viewable" ON storage.objects;

CREATE POLICY "Photographers can view their own portfolio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolios'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);