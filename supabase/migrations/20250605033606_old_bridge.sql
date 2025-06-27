/*
  # Update brands table RLS policies

  1. Changes
    - Drop all existing policies
    - Recreate policies with proper ownership checks
    - Allow users to manage their own unused brands
    - Maintain admin access through JWT role check

  2. Security
    - Users can only manage their own brands that have no estimates
    - Admins retain full access through traffic_admin role
    - All authenticated users can view brands
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view brands" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to create brands" ON brands;
DROP POLICY IF EXISTS "Allow users to update their unused brands" ON brands;
DROP POLICY IF EXISTS "Allow users to delete their unused brands" ON brands;
DROP POLICY IF EXISTS "Enable full access for traffic admins" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;

-- Create new policies
CREATE POLICY "brands_select_policy"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "brands_insert_policy"
ON brands
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "brands_update_policy"
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

CREATE POLICY "brands_delete_policy"
ON brands
FOR DELETE
TO authenticated
USING (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
);