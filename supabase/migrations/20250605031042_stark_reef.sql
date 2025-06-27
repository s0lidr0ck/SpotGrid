/*
  # Update brands table RLS policies

  1. Changes
    - Update RLS policies for brands table to fix permission issues
    - Allow authenticated users to view brands
    - Allow traffic admins to modify brands

  2. Security
    - Enable RLS on brands table (already enabled)
    - Update policies to properly check user role
    - Ensure proper access control based on user role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;

-- Create new policies with proper role checks
CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow traffic admins to insert brands"
ON brands
FOR INSERT
TO authenticated
WITH CHECK (auth.jwt()->>'role' = 'traffic_admin');

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