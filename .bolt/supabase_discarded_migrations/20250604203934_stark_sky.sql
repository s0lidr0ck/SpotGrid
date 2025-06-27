/*
  # Create initial users

  1. Changes
    - Creates admin and regular user accounts if they don't already exist
    - Sets up proper authentication and roles
    - Includes user metadata and profile information

  2. Security
    - Uses secure password hashing
    - Sets up proper role assignments
*/

DO $$ 
BEGIN
  -- Create regular user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'asanders@pursuitchannel.com'
  ) THEN
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
    ) VALUES (
      gen_random_uuid(),
      'asanders@pursuitchannel.com',
      crypt('pursuit', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"firstName": "Alex", "lastName": "Sanders"}',
      now(),
      now(),
      'authenticated'
    );
  END IF;

  -- Create admin user if not exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'traffic@pursuitchannel.com'
  ) THEN
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
    ) VALUES (
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
  END IF;
END $$;