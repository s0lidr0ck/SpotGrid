/*
  # Sync users from auth.users to public.users

  1. Changes
    - Creates a trigger to automatically sync users from auth.users to public.users
    - Syncs existing users from auth.users to public.users
  
  2. Security
    - Maintains RLS policies
    - Only syncs necessary user data
*/

-- Create a function to handle user creation/updates
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

-- Create trigger for syncing new/updated users
DROP TRIGGER IF EXISTS sync_auth_users ON auth.users;
CREATE TRIGGER sync_auth_users
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_sync();

-- Sync existing users
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  COALESCE((raw_user_meta_data->>'firstName')::text, ''),
  COALESCE((raw_user_meta_data->>'lastName')::text, ''),
  CASE 
    WHEN (raw_app_meta_data->>'role')::text = 'traffic_admin' THEN 'traffic_admin'
    ELSE 'user'
  END,
  created_at,
  updated_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;