/*
  # Create demo users

  1. Changes
    - Creates two demo users:
      - Regular user (user@example.com)
      - Admin user (admin@example.com)
    
  2. Security
    - Passwords are properly hashed
    - Admin user has traffic_admin role
*/

-- Create regular user
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- First check if user exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = 'user@example.com';
  
  IF user_id IS NULL THEN
    user_id := gen_random_uuid();
    
    -- Insert into auth.users
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
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      'user@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"firstName": "Alex", "lastName": "Sanders"}'
    );

    -- Insert into public.users if not exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
      INSERT INTO public.users (id, email, first_name, last_name, role)
      VALUES (user_id, 'user@example.com', 'Alex', 'Sanders', 'user');
    END IF;
  END IF;
END $$;

-- Create admin user
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- First check if admin exists in auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = 'admin@example.com';
  
  IF user_id IS NULL THEN
    user_id := gen_random_uuid();
    
    -- Insert into auth.users
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
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      user_id,
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('password123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}',
      '{"firstName": "Traffic", "lastName": "Admin"}'
    );

    -- Insert into public.users if not exists
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = user_id) THEN
      INSERT INTO public.users (id, email, first_name, last_name, role)
      VALUES (user_id, 'admin@example.com', 'Traffic', 'Admin', 'traffic_admin');
    END IF;
  END IF;
END $$;