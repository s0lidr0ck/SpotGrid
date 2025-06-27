/*
  # Update User Roles

  1. Changes
    - Update roles for existing users
    - Ensure proper role assignments in both auth.users and public.users tables
    
  2. Security
    - Maintains existing security model
    - Updates role information in both auth and public tables
*/

-- Update info@pursuitchannel.com to regular user
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
  'provider', 'email',
  'providers', ARRAY['email']
)
WHERE email = 'info@pursuitchannel.com';

UPDATE public.users
SET role = 'user'
WHERE email = 'info@pursuitchannel.com';

-- Update alex@pursuitchannel.com to traffic admin
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
  'provider', 'email',
  'providers', ARRAY['email'],
  'role', 'traffic_admin'
)
WHERE email = 'alex@pursuitchannel.com';

UPDATE public.users
SET role = 'traffic_admin'
WHERE email = 'alex@pursuitchannel.com';

-- Update admin@pursuitchannel.com to admin
UPDATE auth.users
SET raw_app_meta_data = jsonb_build_object(
  'provider', 'email',
  'providers', ARRAY['email'],
  'role', 'traffic_admin'
)
WHERE email = 'admin@pursuitchannel.com';

UPDATE public.users
SET role = 'traffic_admin'
WHERE email = 'admin@pursuitchannel.com';