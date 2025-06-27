/*
  # Fix admin access to user data

  1. Changes
    - Drop existing RLS policies for users table
    - Create new policies that properly allow admins to read all user data
    - Use a more reliable method to check admin role
    
  2. Security
    - Users can read/update their own profile
    - Admins can read/update all user profiles
    - Fix the role checking mechanism
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Create new policies with proper admin access
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
    -- Check if current user has traffic_admin role in the users table
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_app_meta_data->>'role')::text = 'traffic_admin'
        OR
        auth.users.email = 'alex@pursuitchannel.com'
      )
    )
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
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_app_meta_data->>'role')::text = 'traffic_admin'
        OR
        auth.users.email = 'alex@pursuitchannel.com'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        (auth.users.raw_app_meta_data->>'role')::text = 'traffic_admin'
        OR
        auth.users.email = 'alex@pursuitchannel.com'
      )
    )
  );