/*
  # Fix users table schema to match Supabase auth

  1. Changes
    - Remove password column from users table since auth is handled by auth.users
    - Update user sync trigger to match auth schema
*/

-- Remove password column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password'
  ) THEN
    ALTER TABLE users DROP COLUMN password;
  END IF;
END $$;

-- Update the sync trigger to match auth schema
CREATE OR REPLACE FUNCTION handle_auth_user_sync()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
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
      NEW.id,
      NEW.email,
      COALESCE((NEW.raw_user_meta_data->>'firstName')::text, ''),
      COALESCE((NEW.raw_user_meta_data->>'lastName')::text, ''),
      CASE 
        WHEN (NEW.raw_app_meta_data->>'role')::text = 'traffic_admin' THEN 'traffic_admin'
        ELSE 'user'
      END,
      NEW.created_at,
      NEW.updated_at
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      updated_at = EXCLUDED.updated_at;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;