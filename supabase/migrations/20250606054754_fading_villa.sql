/*
  # Fix estimates table RLS policies

  1. Changes
    - Drop existing RLS policies for estimates table
    - Add new comprehensive RLS policies that properly handle all operations
    - Allow admins to see all estimates
    - Allow users to see their own estimates
    
  2. Security
    - Enable RLS on estimates table
    - Add policies for:
      - SELECT: Allow users to see their own estimates and admins to see all
      - INSERT/UPDATE/DELETE: Allow users to manage their own estimates and admins to manage all
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Estimates access policy" ON estimates;

-- Create new policies
CREATE POLICY "estimates_select_policy"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
);

CREATE POLICY "estimates_insert_policy"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
);

CREATE POLICY "estimates_update_policy"
ON estimates
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
)
WITH CHECK (
  owner_id = auth.uid() OR 
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
);

CREATE POLICY "estimates_delete_policy"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
);