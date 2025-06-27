/*
  # Fix RLS policies for brands table

  1. Changes
    - Drop and recreate RLS policies for brands table to ensure consistent permissions
    - Add proper INSERT policy for traffic_admin role
    - Consolidate policies for better maintainability

  2. Security
    - Maintains existing security model where traffic_admin role has full access
    - Keeps read-only access for authenticated users
    - Ensures proper INSERT permissions for admins
*/

-- Drop existing policies to recreate them in a consistent way
DROP POLICY IF EXISTS "Allow admins to delete brands" ON brands;
DROP POLICY IF EXISTS "Allow admins to insert brands" ON brands;
DROP POLICY IF EXISTS "Allow admins to modify brands" ON brands;
DROP POLICY IF EXISTS "Allow admins to update brands" ON brands;
DROP POLICY IF EXISTS "Allow all users to view brands" ON brands;

-- Recreate policies with proper permissions
CREATE POLICY "Enable read access for authenticated users"
  ON brands
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable full access for admin users"
  ON brands
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);