/*
  # Update estimates RLS policies

  1. Changes
    - Drop and recreate RLS policies for estimates table
    - Add index on owner_id for better performance
    - Update policy names to avoid conflicts
    
  2. Security
    - Users can only access their own estimates
    - Traffic admins have full access
    - Proper role checking using JWT
*/

-- Drop existing policies
DROP POLICY IF EXISTS "estimates_select_policy_v4" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy_v4" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy_v4" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy_v4" ON estimates;

-- Create index on owner_id for better performance
CREATE INDEX IF NOT EXISTS estimates_owner_id_idx ON estimates(owner_id);

-- Create new policies
CREATE POLICY "estimates_select_policy_v5"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_insert_policy_v5"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);

CREATE POLICY "estimates_update_policy_v5"
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

CREATE POLICY "estimates_delete_policy_v5"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  auth.jwt()->>'role' = 'traffic_admin'
);