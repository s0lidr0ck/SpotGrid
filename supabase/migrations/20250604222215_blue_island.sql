/*
  # Update brands table RLS policies

  1. Changes
    - Add INSERT policy for traffic admins
    - Add UPDATE policy for traffic admins
    - Ensure proper RLS configuration for brands table

  2. Security
    - Maintains existing SELECT policy for authenticated users
    - Adds specific policies for traffic_admin role
    - Ensures data integrity and proper access control
*/

-- First ensure RLS is enabled
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Drop existing ALL policy if it exists
DROP POLICY IF EXISTS "Enable full access for traffic admins" ON brands;

-- Create specific policies for each operation type
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

-- Ensure the read policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'brands' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
      ON brands
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END
$$;