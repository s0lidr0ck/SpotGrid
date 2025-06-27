/*
  # Fix brands table RLS policies

  1. Changes
    - Drop and recreate RLS policies for brands table
    - Add proper owner-based access control
    - Maintain admin override capabilities
    
  2. Security
    - Allow all authenticated users to view brands
    - Allow users to create their own brands
    - Allow users to update/delete their own unused brands
    - Allow admins full access
*/

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "brands_select_policy" ON brands;
DROP POLICY IF EXISTS "brands_insert_policy" ON brands;
DROP POLICY IF EXISTS "brands_update_policy" ON brands;
DROP POLICY IF EXISTS "brands_delete_policy" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to create brands" ON brands;
DROP POLICY IF EXISTS "Allow users to update their unused brands" ON brands;
DROP POLICY IF EXISTS "Allow users to delete their unused brands" ON brands;
DROP POLICY IF EXISTS "Enable full access for traffic admins" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to view brands" ON brands;

-- Create new policies with unique names
CREATE POLICY "brands_select_policy_v2"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "brands_insert_policy_v2"
ON brands
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "brands_update_policy_v2"
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

CREATE POLICY "brands_delete_policy_v2"
ON brands
FOR DELETE
TO authenticated
USING (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
);