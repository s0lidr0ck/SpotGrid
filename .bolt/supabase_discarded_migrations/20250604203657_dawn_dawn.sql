/*
  # Create initial users

  1. Creates initial admin and regular user accounts
  2. Sets up proper roles and metadata
  3. Uses Supabase auth functions for secure user creation
*/

-- Create admin user
SELECT auth.create_user(
  uid := gen_random_uuid(),
  email := 'traffic@pursuitchannel.com',
  password := 'pursuit',
  email_confirm := true,
  data := jsonb_build_object(
    'firstName', 'Traffic',
    'lastName', 'Admin',
    'role', 'traffic_admin'
  )
);

-- Create regular user
SELECT auth.create_user(
  uid := gen_random_uuid(),
  email := 'asanders@pursuitchannel.com',
  password := 'pursuit',
  email_confirm := true,
  data := jsonb_build_object(
    'firstName', 'Alex',
    'lastName', 'Sanders',
    'role', 'user'
  )
);