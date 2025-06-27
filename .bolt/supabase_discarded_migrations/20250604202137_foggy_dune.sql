/*
  # Create users table and update relationships

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Maps to Supabase Auth user ID
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `role` (text) - Either 'user' or 'traffic_admin'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add user_id foreign key to estimates table
    - Add RLS policies for user-based access control

  3. Security
    - Enable RLS on users table
    - Add policies for user management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'traffic_admin'))
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Add user_id to estimates
ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES users(id);

-- Update estimates policies to include user_id check
DROP POLICY IF EXISTS "Allow all users to view estimates" ON estimates;
DROP POLICY IF EXISTS "Allow admins to modify estimates" ON estimates;

CREATE POLICY "Users can view own estimates"
  ON estimates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  );

CREATE POLICY "Users can manage own estimates"
  ON estimates
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role'::text) = 'traffic_admin'::text
  );

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();