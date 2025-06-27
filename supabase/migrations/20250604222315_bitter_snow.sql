/*
  # Fix Brands RLS Policies

  1. Changes
    - Drop existing RLS policies for brands table
    - Create new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Enable RLS on brands table (already enabled)
    - Add policies for:
      - SELECT: Allow authenticated users to read all brands
      - INSERT: Allow traffic admins to create brands
      - UPDATE: Allow traffic admins to update brands
      - DELETE: Allow traffic admins to delete brands (already exists)
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to update brands" ON brands;
DROP POLICY IF EXISTS "Allow traffic admins to delete brands" ON brands;

-- Create comprehensive policies
CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow traffic admins to insert brands"
ON brands
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

CREATE POLICY "Allow traffic admins to update brands"
ON brands
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

CREATE POLICY "Allow traffic admins to delete brands"
ON brands
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);