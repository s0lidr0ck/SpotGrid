/*
  # Fix infinite recursion in users table RLS policy

  1. Problem
    - Current policy creates infinite recursion by querying users table within the policy itself
    - Policy tries to check user role by selecting from users table, which triggers the same policy

  2. Solution
    - Replace the recursive policy with a simpler approach
    - Use auth.jwt() to get user role from JWT token instead of querying users table
    - Keep basic user access control without circular dependencies

  3. Changes
    - Drop existing problematic policies
    - Create new policies that don't reference users table recursively
    - Use JWT claims for role-based access instead of database queries
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data or admins can read all" ON users;
DROP POLICY IF EXISTS "Users can update own data or admins can update all" ON users;

-- Create new policies without recursion
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'traffic_admin'
    OR 
    auth.jwt() ->> 'role' = 'traffic_admin'
  );

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'traffic_admin'
    OR 
    auth.jwt() ->> 'role' = 'traffic_admin'
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'traffic_admin'
    OR 
    auth.jwt() ->> 'role' = 'traffic_admin'
  );