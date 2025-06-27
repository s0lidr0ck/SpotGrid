/*
  # Update Demo Users and Credentials

  1. Changes
    - Update existing users' credentials
    - Add new admin user
    - Ensure proper role assignments
    
  2. Security
    - All passwords are properly hashed
    - Proper role assignments maintained
*/

-- Function to safely update or create users
CREATE OR REPLACE FUNCTION update_or_create_user(
  p_email TEXT,
  p_password TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_role TEXT
)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user exists in auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  IF v_user_id IS NULL THEN
    -- Create new user
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
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      p_email,
      crypt(p_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email'],
        'role', p_role
      ),
      jsonb_build_object(
        'firstName', p_first_name,
        'lastName', p_last_name
      )
    ) RETURNING id INTO v_user_id;
  ELSE
    -- Update existing user
    UPDATE auth.users
    SET
      encrypted_password = crypt(p_password, gen_salt('bf')),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email'],
        'role', p_role
      ),
      raw_user_meta_data = jsonb_build_object(
        'firstName', p_first_name,
        'lastName', p_last_name
      ),
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Update or create user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_first_name,
    p_last_name,
    p_role,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Update/Create regular user
SELECT update_or_create_user(
  'info@pursuitchannel.com',
  'pursuit',
  'Info',
  'User',
  'user'
);

-- Update/Create traffic admin
SELECT update_or_create_user(
  'alex@pursuitchannel.com',
  'pursuit',
  'Alex',
  'Admin',
  'traffic_admin'
);

-- Update/Create admin user
SELECT update_or_create_user(
  'admin@pursuitchannel.com',
  'pursuit',
  'System',
  'Admin',
  'admin'
);

-- Clean up
DROP FUNCTION update_or_create_user;