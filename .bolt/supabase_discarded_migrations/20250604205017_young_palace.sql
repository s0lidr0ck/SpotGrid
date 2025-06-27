/*
  # Set up authentication and users table

  1. New Tables
    - `users` table with authentication fields
  2. Security
    - Enable RLS on users table
    - Add policies for user access
*/

-- Create users table if it doesn't exist
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

-- Create policies
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
  USING ((auth.jwt() ->> 'role')::text = 'traffic_admin')
  WITH CHECK ((auth.jwt() ->> 'role')::text = 'traffic_admin');

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();