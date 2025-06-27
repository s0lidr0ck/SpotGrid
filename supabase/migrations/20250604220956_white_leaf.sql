/*
  # Add RLS policies for brands table

  1. Security Changes
    - Add INSERT policy for traffic_admin role
    - Add UPDATE policy for traffic_admin role
    - Add DELETE policy for traffic_admin role
    - Ensure SELECT policy exists for all authenticated users

  This migration adds the necessary RLS policies to allow traffic_admin users
  to perform CRUD operations on the brands table while maintaining read access
  for all authenticated users.
*/

-- First ensure RLS is enabled
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for traffic admins
CREATE POLICY "Allow admins to insert brands"
ON brands
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create UPDATE policy for traffic admins
CREATE POLICY "Allow admins to update brands"
ON brands
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create DELETE policy for traffic admins
CREATE POLICY "Allow admins to delete brands"
ON brands
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Ensure SELECT policy exists (recreate if needed)
DROP POLICY IF EXISTS "Allow all users to view brands" ON brands;
CREATE POLICY "Allow all users to view brands"
ON brands
FOR SELECT
TO authenticated
USING (true);