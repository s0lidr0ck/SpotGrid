/*
  # Sync new user to public.users table

  1. Changes
    - Add new user info@pursuitchannel.com to public.users table
    - Ensures user exists in public.users with correct role and profile data
*/

DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'info@pursuitchannel.com';

  -- If we found the user in auth.users, sync to public.users
  IF user_id IS NOT NULL THEN
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      'info@pursuitchannel.com',
      'Info',
      'User',
      'user',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;
END $$;