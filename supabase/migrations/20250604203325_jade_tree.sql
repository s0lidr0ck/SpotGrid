/*
  # Create Authentication Users

  1. Changes
    - Add two initial users:
      - Regular User: Alex Sanders (asanders@pursuitchannel.com)
      - Admin User: Traffic Admin (traffic@pursuitchannel.com)

  2. Security
    - Users are created with secure password hashing
    - Admin user is granted traffic_admin role
*/

-- Create users with hashed passwords
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) VALUES
-- Regular User
(
  gen_random_uuid(),
  'asanders@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"firstName": "Alex", "lastName": "Sanders"}',
  now(),
  now(),
  'authenticated'
),
-- Admin User
(
  gen_random_uuid(),
  'traffic@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}',
  '{"firstName": "Traffic", "lastName": "Admin"}',
  now(),
  now(),
  'authenticated'
);