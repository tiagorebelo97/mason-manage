-- Storage Bucket Setup for Observacoes Images
-- Run this in Supabase SQL editor to create the storage bucket for observacoes images

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('orcamento-observacoes', 'orcamento-observacoes', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orcamento-observacoes');

-- Allow authenticated users to update their own files
CREATE POLICY IF NOT EXISTS "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'orcamento-observacoes');

-- Allow authenticated users to delete their own files
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'orcamento-observacoes');

-- Allow public read access for images
CREATE POLICY IF NOT EXISTS "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'orcamento-observacoes');
