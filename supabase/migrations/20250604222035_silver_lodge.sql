/*
  # Add INSERT policy for brands table

  1. Changes
    - Add new RLS policy to allow traffic admins to create brands
    
  2. Security
    - Only traffic admins can create new brands
    - Maintains existing policies for read/update/delete operations
*/

CREATE POLICY "Allow traffic admins to create brands"
  ON brands
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);