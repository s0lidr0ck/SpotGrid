/*
  # Configure Authentication

  1. Changes
    - Enable email/password authentication
    - Set up auth configuration
    - Update user passwords
*/

-- Enable email/password authentication
UPDATE auth.providers
SET enabled = true
WHERE provider_id = 'email';

-- Configure auth settings
UPDATE auth.config
SET
  email_confirm_required = false,
  double_confirm_changes = false,
  enable_signup = true;

-- Update user passwords
UPDATE auth.users
SET encrypted_password = crypt('pursuit', gen_salt('bf'))
WHERE email IN ('asanders@pursuitchannel.com', 'traffic@pursuitchannel.com');