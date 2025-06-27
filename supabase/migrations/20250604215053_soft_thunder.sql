/*
  # Create Demo Users

  1. Changes
    - Creates two demo users:
      - Regular User: user@example.com
      - Admin User: admin@example.com
    - Sets up both auth.users and public.users records
    - Handles existing users gracefully
  
  2. Security
    - Passwords are properly hashed
    - Admin user has traffic_admin role
*/

DO $$
DECLARE
  regular_user_uid UUID;
  admin_user_uid UUID;
BEGIN
  -- Check and get or create regular user
  SELECT id INTO regular_user_uid
  FROM auth.users
  WHERE email = 'user@example.com';

  IF regular_user_uid IS NULL THEN
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
      raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'user@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"firstName": "Alex", "lastName": "Sanders"}'
    )
    RETURNING id INTO regular_user_uid;
  END IF;

  -- Check and get or create admin user
  SELECT id INTO admin_user_uid
  FROM auth.users
  WHERE email = 'admin@example.com';

  IF admin_user_uid IS NULL THEN
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
      raw_user_meta_data
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}',
      '{"firstName": "Traffic", "lastName": "Admin"}'
    )
    RETURNING id INTO admin_user_uid;
  END IF;

  -- Create or update regular user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role
  )
  VALUES (
    regular_user_uid,
    'user@example.com',
    'Alex',
    'Sanders',
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

  -- Create or update admin user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role
  )
  VALUES (
    admin_user_uid,
    'admin@example.com',
    'Traffic',
    'Admin',
    'traffic_admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;
END $$;