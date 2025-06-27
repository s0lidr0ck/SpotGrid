/*
  # Add RLS policies for brands table

  1. Changes
    - Add INSERT policy for traffic_admin users to create brands
    - Add UPDATE policy for traffic_admin users to modify brands
    - Add DELETE policy for traffic_admin users to remove brands
    - Add SELECT policy for authenticated users to view brands

  2. Security
    - Ensures only traffic_admin users can create, update, and delete brands
    - Allows all authenticated users to view brands
*/

-- Enable RLS on brands table (if not already enabled)
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting brands (traffic_admin only)
CREATE POLICY "Allow traffic_admin to create brands"
ON brands
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create policy for updating brands (traffic_admin only)
CREATE POLICY "Allow traffic_admin to update brands"
ON brands
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create policy for deleting brands (traffic_admin only)
CREATE POLICY "Allow traffic_admin to delete brands"
ON brands
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create policy for reading brands (all authenticated users)
CREATE POLICY "Allow authenticated users to view brands"
ON brands
FOR SELECT
TO authenticated
USING (true);