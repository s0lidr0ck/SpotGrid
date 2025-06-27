/*
  # Create initial users
  
  Creates the initial admin and regular user accounts in the system.
  
  1. Users Created
    - Admin user (traffic@pursuitchannel.com)
    - Regular user (asanders@pursuitchannel.com)
    
  2. Security
    - Passwords are properly hashed
    - Email confirmation is enabled
    - Proper roles are assigned
*/

-- Create admin user
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
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'traffic@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}'::jsonb,
  '{"firstName": "Traffic", "lastName": "Admin"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
);

-- Create regular user
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
  aud
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'asanders@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"firstName": "Alex", "lastName": "Sanders"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
);