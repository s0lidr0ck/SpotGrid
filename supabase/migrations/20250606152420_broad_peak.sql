/*
  # Fix users table RLS policies for authentication

  1. Security Updates
    - Drop existing problematic policies on users table
    - Create new simplified policies that work with Supabase auth
    - Ensure authenticated users can read their own profile data
    - Allow traffic_admins to read all user profiles
    - Fix policy conditions to work with auth.uid()

  2. Changes
    - Remove complex policy conditions that may be causing permission issues
    - Simplify policy logic for better reliability
    - Ensure compatibility with Supabase auth system
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "users_select_own_profile" ON users;
DROP POLICY IF EXISTS "users_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_insert_own_profile" ON users;
DROP POLICY IF EXISTS "admins_select_all_profiles" ON users;
DROP POLICY IF EXISTS "admins_update_all_profiles" ON users;

-- Create new simplified policies
-- Allow users to read their own profile
CREATE POLICY "users_can_read_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "users_can_insert_own_profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow traffic admins to read all profiles
CREATE POLICY "traffic_admins_can_read_all_profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'traffic_admin'
    )
  );

-- Allow traffic admins to update all profiles
CREATE POLICY "traffic_admins_can_update_all_profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'traffic_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'traffic_admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;