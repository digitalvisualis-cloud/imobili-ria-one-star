
-- Create storage bucket for property images and videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imoveis',
  'imoveis',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload property files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'imoveis');

-- Allow authenticated users to update their files
CREATE POLICY "Authenticated users can update property files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'imoveis');

-- Allow authenticated users to delete property files
CREATE POLICY "Authenticated users can delete property files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'imoveis');

-- Allow public read access to property files
CREATE POLICY "Public read access for property files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'imoveis');
