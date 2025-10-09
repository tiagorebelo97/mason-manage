-- Storage Bucket Setup for Orcamento Files
-- This migration creates the storage bucket and policies needed for file uploads in MapaQuantidades

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'orcamento-files',
  'orcamento-files',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.ms-excel.sheet.macroEnabled.12'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to orcamento-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'orcamento-files');

-- Policy: Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads from orcamento-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'orcamento-files');

-- Policy: Allow public read access (optional - remove if files should be private)
CREATE POLICY "Allow public reads from orcamento-files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'orcamento-files');

-- Policy: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes from orcamento-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'orcamento-files');

-- Policy: Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates to orcamento-files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'orcamento-files')
WITH CHECK (bucket_id = 'orcamento-files');
