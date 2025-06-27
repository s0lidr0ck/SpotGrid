/*
  # Fix Estimates RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies with proper role checks and owner access
    - Fix syntax for role checks
    
  2. Security
    - Users can view and manage their own estimates
    - Admins can view and manage all estimates
    - Proper role check syntax using auth.jwt()->>'role'
*/

-- Drop existing policies
DROP POLICY IF EXISTS "estimates_select_policy_v2" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy_v2" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy_v2" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy_v2" ON estimates;

-- Create new policies with fixed role checks
CREATE POLICY "estimates_select_policy_v3"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_insert_policy_v3"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_update_policy_v3"
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

CREATE POLICY "estimates_delete_policy_v3"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);