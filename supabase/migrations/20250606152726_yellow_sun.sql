/*
  # Fix Users RLS Policies - Final Solution

  1. Changes
    - Drop ALL existing policies on users table
    - Create new policies that don't cause infinite recursion
    - Use auth.uid() and direct JWT checks only
    - Avoid any queries to the users table within policies

  2. Security
    - Users can read and update their own profile
    - Users can insert their own profile during registration
    - Traffic admins get full access via JWT role check
*/

-- Drop ALL existing policies on users table
DROP POLICY IF EXISTS "users_can_read_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON users;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON users;
DROP POLICY IF EXISTS "traffic_admins_can_read_all_profiles_v2" ON users;
DROP POLICY IF EXISTS "traffic_admins_can_update_all_profiles_v2" ON users;

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new policies without any recursion
CREATE POLICY "users_select_policy"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- Users can read their own profile
    auth.uid() = id
    OR
    -- Traffic admins can read all profiles (check JWT directly)
    (auth.jwt() ->> 'email') = 'alex@pursuitchannel.com'
    OR
    -- Also check raw_app_meta_data for role
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'traffic_admin'
  );

CREATE POLICY "users_insert_policy"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    -- Users can update their own profile
    auth.uid() = id
    OR
    -- Traffic admins can update all profiles
    (auth.jwt() ->> 'email') = 'alex@pursuitchannel.com'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'traffic_admin'
  )
  WITH CHECK (
    -- Users can update their own profile
    auth.uid() = id
    OR
    -- Traffic admins can update all profiles
    (auth.jwt() ->> 'email') = 'alex@pursuitchannel.com'
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'traffic_admin'
  );