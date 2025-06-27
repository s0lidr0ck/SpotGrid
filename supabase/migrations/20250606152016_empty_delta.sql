/*
  # Fix Users Table RLS Policies

  1. Changes
    - Update RLS policies for users table to allow admins to read all user data
    - Ensure traffic admins can access user information for all users
    - Fix the issue where admin users cannot fetch user data for estimates
    
  2. Security
    - Users can read their own data
    - Traffic admins can read all user data (needed for admin views)
    - Maintains existing security model
*/

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create new policies that allow admins to read all user data
CREATE POLICY "Users can read own data or admins can read all"
ON users
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);

CREATE POLICY "Users can update own data or admins can update all"
ON users
FOR UPDATE
TO authenticated
USING (
  id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
)
WITH CHECK (
  id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);