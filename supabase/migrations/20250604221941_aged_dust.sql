/*
  # Fix Brands RLS Policies

  1. Changes
    - Update RLS policies for brands table to properly handle all operations
    - Ensure traffic_admin role can perform all operations
    - Allow authenticated users to view brands

  2. Security
    - Enable RLS on brands table (already enabled)
    - Add proper policies for INSERT operations
    - Maintain existing policies for other operations
*/

-- Drop existing policies to recreate them with correct permissions
DROP POLICY IF EXISTS "Enable delete access for traffic admin" ON brands;
DROP POLICY IF EXISTS "Enable insert access for traffic admin" ON brands;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON brands;
DROP POLICY IF EXISTS "Enable update access for traffic admin" ON brands;

-- Create comprehensive policies for brands table
CREATE POLICY "Enable all access for traffic admin"
  ON brands
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  );

CREATE POLICY "Enable read access for authenticated users"
  ON brands
  FOR SELECT
  TO authenticated
  USING (true);