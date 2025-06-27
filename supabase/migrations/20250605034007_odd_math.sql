/*
  # Add owner_id to estimates table

  1. Changes
    - Add `owner_id` column to `estimates` table
    - Add foreign key constraint to link with auth.users
    - Update RLS policies to include owner-based access

  2. Security
    - Add policy for users to manage their own estimates
    - Maintain existing admin access
*/

-- Add owner_id column
ALTER TABLE estimates 
ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- Update RLS policies to include owner-based access
DROP POLICY IF EXISTS "Allow admins to modify estimates" ON estimates;
DROP POLICY IF EXISTS "Allow all users to view estimates" ON estimates;

CREATE POLICY "Estimates access policy"
ON estimates
FOR ALL
TO authenticated
USING (
  (owner_id = auth.uid() OR (auth.jwt() ->> 'role')::text = 'traffic_admin')
)
WITH CHECK (
  (owner_id = auth.uid() OR (auth.jwt() ->> 'role')::text = 'traffic_admin')
);