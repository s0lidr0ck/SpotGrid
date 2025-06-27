/*
  # Fix Media Assets RLS Policies

  1. Changes
    - Drop existing RLS policies for media_assets table
    - Add new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Allow all authenticated users to view media assets
    - Allow authenticated users to create media assets
    - Allow users to delete their own media assets
    - Allow admins full access to all media assets
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all users to view media assets" ON media_assets;
DROP POLICY IF EXISTS "Allow admins to modify media assets" ON media_assets;
DROP POLICY IF EXISTS "Allow authenticated users to insert media assets" ON media_assets;

-- Create new policies
CREATE POLICY "media_assets_select_policy"
ON media_assets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "media_assets_insert_policy"
ON media_assets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "media_assets_delete_policy"
ON media_assets
FOR DELETE
TO authenticated
USING (
  -- Allow users to delete their own media assets or admins to delete any
  (auth.uid() = (SELECT owner_id FROM brands WHERE id = brand_id)) OR
  (auth.jwt()->>'role' = 'traffic_admin')
);

CREATE POLICY "media_assets_update_policy"
ON media_assets
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'role' = 'traffic_admin')
WITH CHECK (auth.jwt()->>'role' = 'traffic_admin');