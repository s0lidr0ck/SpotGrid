/*
  # Fix RLS policies for users table

  1. Security Updates
    - Drop existing problematic policies
    - Create new policies that properly handle authentication context
    - Ensure users can read their own profile data
    - Ensure admins can read all user data
    - Add policy for user profile creation during signup

  2. Changes
    - Replace existing SELECT policies with more robust versions
    - Add INSERT policy for user profile creation
    - Ensure proper authentication context handling
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create new SELECT policy for users to read their own profile
CREATE POLICY "users_select_own_profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create new SELECT policy for admins to read all profiles
CREATE POLICY "admins_select_all_profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (
        (au.raw_app_meta_data ->> 'role') = 'traffic_admin'
        OR au.email = 'alex@pursuitchannel.com'
      )
    )
  );

-- Create INSERT policy for user profile creation
CREATE POLICY "users_insert_own_profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create UPDATE policy for users to update their own profile
CREATE POLICY "users_update_own_profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create UPDATE policy for admins to update all profiles
CREATE POLICY "admins_update_all_profiles"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (
        (au.raw_app_meta_data ->> 'role') = 'traffic_admin'
        OR au.email = 'alex@pursuitchannel.com'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users au
      WHERE au.id = auth.uid()
      AND (
        (au.raw_app_meta_data ->> 'role') = 'traffic_admin'
        OR au.email = 'alex@pursuitchannel.com'
      )
    )
  );