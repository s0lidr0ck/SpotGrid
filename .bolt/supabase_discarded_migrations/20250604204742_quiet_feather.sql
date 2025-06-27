/*
  # Set up public users table for authentication
  
  1. Changes
    - Drop existing users table if it exists
    - Create new users table with password field
    - Add RLS policies for user management
    - Insert test users with hashed passwords
    
  2. Security
    - Enable RLS on users table
    - Add policies for user authentication
    - Secure password handling with pgcrypto
*/

-- Drop existing users table and related objects
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table with password field
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('user', 'traffic_admin'))
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'traffic_admin');

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR auth.jwt() ->> 'role' = 'traffic_admin')
  WITH CHECK (id = auth.uid() OR auth.jwt() ->> 'role' = 'traffic_admin');

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert test users
INSERT INTO public.users (email, password, first_name, last_name, role)
VALUES
  ('asanders@pursuitchannel.com', crypt('pursuit', gen_salt('bf')), 'Alex', 'Sanders', 'user'),
  ('traffic@pursuitchannel.com', crypt('pursuit', gen_salt('bf')), 'Traffic', 'Admin', 'traffic_admin');