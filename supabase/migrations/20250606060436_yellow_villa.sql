/*
  # Fix Estimates RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies with proper role checks
    - Add index on owner_id for better performance
    
  2. Security
    - Allow users to view and manage their own estimates
    - Allow traffic admins full access to all estimates
    - Ensure proper role checking using auth.jwt()->>'role'
*/

-- Create index on owner_id for better performance
CREATE INDEX IF NOT EXISTS estimates_owner_id_idx ON estimates(owner_id);

-- Drop existing policies
DROP POLICY IF EXISTS "estimates_select_policy_v3" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy_v3" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy_v3" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy_v3" ON estimates;

-- Create new policies with proper role checks
CREATE POLICY "estimates_select_policy_v4"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_insert_policy_v4"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_update_policy_v4"
ON estimates
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
)
WITH CHECK (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_delete_policy_v4"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);