/*
  # Fix brands table RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies using correct auth functions
    - Add owner-based access control
    - Maintain admin override capabilities
    
  2. Security
    - Allow all authenticated users to view brands
    - Allow authenticated users to create brands
    - Allow owners to update/delete unused brands
    - Allow admins to manage all brands
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to create brands" ON brands;
DROP POLICY IF EXISTS "Allow users to update their unused brands" ON brands;
DROP POLICY IF EXISTS "Allow users to delete their unused brands" ON brands;

-- Create new policies
CREATE POLICY "Allow authenticated users to view brands"
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
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
)
WITH CHECK (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
);

CREATE POLICY "Allow users to delete their unused brands"
ON brands
FOR DELETE
TO authenticated
USING (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
);