-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('nutrition', 'nutrition', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('progress', 'progress', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for nutrition bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'nutrition' );

CREATE POLICY "Authenticated users can upload meal photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'nutrition' );

CREATE POLICY "Users can delete their own meal photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'nutrition' AND (storage.foldername(name))[1] = auth.uid()::text );

-- RLS for progress bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'progress' );

CREATE POLICY "Authenticated users can upload progress photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'progress' );

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'progress' AND (storage.foldername(name))[1] = auth.uid()::text );
