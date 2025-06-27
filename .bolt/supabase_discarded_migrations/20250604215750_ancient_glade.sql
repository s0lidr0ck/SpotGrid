/*
  # Fix demo user accounts

  1. Changes
    - Remove existing demo users
    - Create new demo users with correct credentials
    - Ensure both auth.users and public.users are in sync
    
  2. Security
    - Maintains existing RLS policies
    - Sets up proper roles and permissions
*/

-- First, remove existing demo users if they exist
DO $$
BEGIN
  -- Delete from public.users first (due to foreign key constraint)
  DELETE FROM public.users 
  WHERE email IN ('asanders@pursuitchannel.com', 'traffic@pursuitchannel.com');

  -- Then delete from auth.users
  DELETE FROM auth.users 
  WHERE email IN ('asanders@pursuitchannel.com', 'traffic@pursuitchannel.com');
END $$;

-- Create new demo users
DO $$
DECLARE
  regular_user_id uuid := gen_random_uuid();
  admin_user_id uuid := gen_random_uuid();
BEGIN
  -- Create regular user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    regular_user_id,
    'authenticated',
    'authenticated',
    'asanders@pursuitchannel.com',
    crypt('pursuit', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"firstName": "Alex", "lastName": "Sanders"}',
    now()
  );

  -- Create admin user in auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    confirmed_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_user_id,
    'authenticated',
    'authenticated',
    'traffic@pursuitchannel.com',
    crypt('pursuit', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}',
    '{"firstName": "Traffic", "lastName": "Admin"}',
    now()
  );

  -- Create regular user in public.users
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    regular_user_id,
    'asanders@pursuitchannel.com',
    'Alex',
    'Sanders',
    'user'
  );

  -- Create admin user in public.users
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    admin_user_id,
    'traffic@pursuitchannel.com',
    'Traffic',
    'Admin',
    'traffic_admin'
  );
END $$;