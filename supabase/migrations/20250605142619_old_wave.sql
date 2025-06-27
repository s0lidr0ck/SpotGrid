DO $$
BEGIN
  -- Create the storage bucket if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'media'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit)
    VALUES ('media', 'media', true, 524288000);  -- 500MB in bytes
  ELSE
    -- Update existing bucket's file size limit
    UPDATE storage.buckets
    SET file_size_limit = 524288000  -- 500MB in bytes
    WHERE id = 'media';
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload media files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own media files" ON storage.objects;

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