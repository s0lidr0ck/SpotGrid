/*
  # Fix infinite recursion in users table RLS policies

  1. Problem
    - The current policies for traffic_admins_can_read_all_profiles and traffic_admins_can_update_all_profiles
      are causing infinite recursion by querying the users table within the policy itself
    - This creates a circular dependency when evaluating the policy

  2. Solution
    - Drop the problematic policies
    - Create new policies that use auth.jwt() to check the role directly from the JWT token
    - This avoids querying the users table within the policy evaluation

  3. Security
    - Maintains the same access control but without the recursive dependency
    - Traffic admins can still read and update all profiles
    - Regular users can still only access their own profiles
*/

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "traffic_admins_can_read_all_profiles" ON users;
DROP POLICY IF EXISTS "traffic_admins_can_update_all_profiles" ON users;

-- Create new policies that use JWT claims instead of querying the users table
CREATE POLICY "traffic_admins_can_read_all_profiles_v2"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  );

CREATE POLICY "traffic_admins_can_update_all_profiles_v2"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  )
  WITH CHECK (
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  );