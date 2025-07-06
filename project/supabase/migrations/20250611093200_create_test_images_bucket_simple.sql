-- Create test-images bucket with simple policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'test-images', 
    'test-images', 
    true, 
    5242880, -- 5MB in bytes
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Simple public access policy
CREATE POLICY "Public Access Test Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'test-images');

-- Simple authenticated upload policy
CREATE POLICY "Authenticated Upload Test Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'test-images');

-- Simple authenticated update policy
CREATE POLICY "Authenticated Update Test Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'test-images');

-- Simple authenticated delete policy
CREATE POLICY "Authenticated Delete Test Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'test-images'); 