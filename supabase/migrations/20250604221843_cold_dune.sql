/*
  # Fix Brands RLS Policies

  1. Changes
    - Remove existing RLS policies for brands table
    - Add new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Enable RLS on brands table
    - Add policies for:
      - SELECT: All authenticated users can view brands
      - INSERT: Only traffic_admin can create brands
      - UPDATE: Only traffic_admin can update brands
      - DELETE: Only traffic_admin can delete brands
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to view brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic_admin to create brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic_admin to delete brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic_admin to update brands" ON brands;
DROP POLICY IF EXISTS "Enable full access for admin users" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON brands FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert access for traffic admin"
ON brands FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

CREATE POLICY "Enable update access for traffic admin"
ON brands FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

CREATE POLICY "Enable delete access for traffic admin"
ON brands FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);