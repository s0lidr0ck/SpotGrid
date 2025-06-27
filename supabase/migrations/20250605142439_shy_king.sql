/*
  # Create media storage bucket and policies

  1. Changes
    - Create a new storage bucket for media files
    - Add policies for:
      - Reading media files (authenticated users)
      - Uploading media files (authenticated users)
      - Deleting media files (file owners only)
    
  2. Security
    - Bucket is public but access controlled via policies
    - Only specific file types allowed
    - Private folder access restricted
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Policy to allow authenticated users to read media files
CREATE POLICY "Allow authenticated users to read media files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'media');

-- Policy to allow authenticated users to upload media files
CREATE POLICY "Allow authenticated users to upload media files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (storage.extension(name) = ANY (ARRAY['mp4', 'mov', 'avi', 'wmv', 'mp3', 'wav', 'm4a', 'aac']))
  AND position('private/' in name) = 0
);

-- Policy to allow authenticated users to delete their own media files
CREATE POLICY "Allow authenticated users to delete their own media files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
);