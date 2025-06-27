/*
  # Fix Authentication Configuration
  
  1. Changes
    - Remove direct auth.providers update
    - Configure authentication settings properly
    - Update user passwords
*/

-- Configure auth settings
UPDATE auth.config SET
  site_url = 'http://localhost:5173',
  additional_redirect_urls = array['http://localhost:5173'],
  jwt_exp = 3600,
  email_confirm_required = false,
  double_confirm_changes = false,
  enable_signup = true;

-- Update user passwords
UPDATE auth.users
SET encrypted_password = crypt('pursuit', gen_salt('bf'))
WHERE email IN ('asanders@pursuitchannel.com', 'traffic@pursuitchannel.com');