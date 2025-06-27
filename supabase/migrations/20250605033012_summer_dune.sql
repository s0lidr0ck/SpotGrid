/*
  # Update brand policies to allow users to edit their own unused brands

  1. Changes
    - Add owner_id column to brands table to track who created each brand
    - Update policies to allow users to edit their own brands if not used in estimates
    - Maintain traffic admin's full access
    
  2. Security
    - Users can only edit their own brands
    - Users cannot edit brands used in estimates
    - Traffic admins retain full access
*/

-- Add owner_id column to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id);

-- Set owner_id to current user on insert
CREATE OR REPLACE FUNCTION set_brand_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_brand_owner_trigger
  BEFORE INSERT ON brands
  FOR EACH ROW
  EXECUTE FUNCTION set_brand_owner();

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to create brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create brands"
ON brands
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their unused brands"
ON brands
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = owner_id AND NOT EXISTS (
    SELECT 1 FROM estimates WHERE brand_id = brands.id
  ))
  OR (auth.jwt()->>'role' = 'traffic_admin')
)
WITH CHECK (
  (auth.uid() = owner_id AND NOT EXISTS (
    SELECT 1 FROM estimates WHERE brand_id = brands.id
  ))
  OR (auth.jwt()->>'role' = 'traffic_admin')
);

CREATE POLICY "Allow users to delete their unused brands"
ON brands
FOR DELETE
TO authenticated
USING (
  (auth.uid() = owner_id AND NOT EXISTS (
    SELECT 1 FROM estimates WHERE brand_id = brands.id
  ))
  OR (auth.jwt()->>'role' = 'traffic_admin')
);