-- First, ensure we can safely create new users
DO $$
DECLARE
  regular_user_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get existing user IDs if they exist
  SELECT id INTO regular_user_id FROM auth.users WHERE email = 'asanders@pursuitchannel.com';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'traffic@pursuitchannel.com';

  -- If users don't exist in auth.users, create them
  IF regular_user_id IS NULL THEN
    regular_user_id := gen_random_uuid();
    
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
      regular_user_id,
      'authenticated',
      'authenticated',
      'asanders@pursuitchannel.com',
      crypt('pursuit', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"firstName": "Alex", "lastName": "Sanders"}'
    );
  END IF;

  IF admin_user_id IS NULL THEN
    admin_user_id := gen_random_uuid();
    
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
      admin_user_id,
      'authenticated',
      'authenticated',
      'traffic@pursuitchannel.com',
      crypt('pursuit', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"], "role": "traffic_admin"}',
      '{"firstName": "Traffic", "lastName": "Admin"}'
    );
  END IF;

  -- Upsert into public.users
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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

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
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role;

END $$;