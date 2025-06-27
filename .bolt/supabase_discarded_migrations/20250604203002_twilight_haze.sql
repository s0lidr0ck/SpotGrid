/*
  # Create initial users

  1. New Users
    - Admin user (traffic@pursuitchannel.com)
    - Regular user (asanders@pursuitchannel.com)
    
  2. Security
    - Users are created in auth.users table
    - Corresponding records created in public.users table
    - Passwords are hashed by Supabase auth
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
  role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'traffic@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Traffic","last_name":"Admin"}',
  now(),
  now(),
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
  role
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'asanders@pursuitchannel.com',
  crypt('pursuit', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"Alex","last_name":"Sanders"}',
  now(),
  now(),
  'authenticated'
);

-- Create corresponding user records in public.users table
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  'traffic@pursuitchannel.com',
  'Traffic',
  'Admin',
  'traffic_admin'
),
(
  '00000000-0000-0000-0000-000000000002',
  'asanders@pursuitchannel.com',
  'Alex',
  'Sanders',
  'user'
);