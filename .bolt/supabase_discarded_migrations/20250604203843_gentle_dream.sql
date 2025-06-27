/*
  # Create initial users

  1. Changes
    - Creates initial admin and regular user accounts
    - Sets up proper authentication and roles
    - Ensures email confirmation
    - Adds user metadata

  2. Security
    - Passwords are properly hashed
    - Role-based access control is configured
*/

-- First, ensure we have the crypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the users with proper structure
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token
) VALUES 
-- Admin user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'traffic@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email'],
    'role', 'traffic_admin'
  ),
  jsonb_build_object(
    'firstName', 'Traffic',
    'lastName', 'Admin'
  ),
  now(),
  now(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex')
),
-- Regular user
(
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'asanders@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  jsonb_build_object(
    'provider', 'email',
    'providers', ARRAY['email']
  ),
  jsonb_build_object(
    'firstName', 'Alex',
    'lastName', 'Sanders'
  ),
  now(),
  now(),
  'authenticated',
  'authenticated',
  encode(gen_random_bytes(32), 'hex')
);

-- Create identities for the users
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(),
  now(),
  now()
FROM auth.users;