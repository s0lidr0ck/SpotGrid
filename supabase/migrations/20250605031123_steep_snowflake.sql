/*
  # Update brands RLS policies to allow regular users to create brands

  1. Changes
    - Allow all authenticated users to create brands
    - Maintain existing read access for all authenticated users
    - Keep update/delete restricted to traffic admins only
    
  2. Security
    - All authenticated users can now create brands
    - Only traffic admins can modify or delete brands
    - All authenticated users can view brands
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;

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

CREATE POLICY "Allow traffic admins to update brands"
ON brands
FOR UPDATE
TO authenticated
USING (auth.jwt()->>'role' = 'traffic_admin')
WITH CHECK (auth.jwt()->>'role' = 'traffic_admin');

CREATE POLICY "Allow traffic admins to delete brands"
ON brands
FOR DELETE
TO authenticated
USING (auth.jwt()->>'role' = 'traffic_admin');