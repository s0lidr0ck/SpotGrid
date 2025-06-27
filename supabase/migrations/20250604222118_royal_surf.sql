/*
  # Fix Brands RLS Policies

  1. Changes
    - Drop existing RLS policies for brands table
    - Create new, properly structured RLS policies for brands table
    
  2. Security
    - Enable RLS on brands table
    - Add policies for:
      - Traffic admins to have full access
      - Authenticated users to read brands
      - Traffic admins to create/update/delete brands
*/

-- First, drop existing policies
DROP POLICY IF EXISTS "Allow traffic admins to create brands" ON brands;
DROP POLICY IF EXISTS "Enable all access for traffic admin" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;

-- Re-create policies with proper permissions
CREATE POLICY "Enable read access for authenticated users"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable full access for traffic admins"
ON brands
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);