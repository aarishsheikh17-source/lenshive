
CREATE POLICY "Photographers can upload to their own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Photographers can delete their own portfolio files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'portfolios' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view portfolio files" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'portfolios');
