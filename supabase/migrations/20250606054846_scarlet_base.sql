/*
  # Fix estimates RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive RLS policies for estimates table
    - Add proper owner and admin role checks
    
  2. Security
    - Allow users to view and manage their own estimates
    - Allow admins full access to all estimates
    - Maintain proper access control based on user role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "estimates_select_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy" ON estimates;

-- Create new policies with proper role checks
CREATE POLICY "estimates_select_policy_v2"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt()->>'role')::text = 'traffic_admin'
);

CREATE POLICY "estimates_insert_policy_v2"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  (auth.jwt()->>'role')::text = 'traffic_admin'
);

CREATE POLICY "estimates_update_policy_v2"
ON estimates
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt()->>'role')::text = 'traffic_admin'
)
WITH CHECK (
  owner_id = auth.uid() OR 
  (auth.jwt()->>'role')::text = 'traffic_admin'
);

CREATE POLICY "estimates_delete_policy_v2"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt()->>'role')::text = 'traffic_admin'
);