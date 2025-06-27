/*
  # Add password verification function
  
  1. Changes
    - Create function to verify user passwords
    - Function uses pgcrypto to compare hashed passwords
    
  2. Security
    - Function is marked as SECURITY DEFINER to run with elevated privileges
    - Input is properly sanitized
*/

CREATE OR REPLACE FUNCTION verify_user_password(email text, password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_password text;
BEGIN
  -- Get the stored password hash
  SELECT u.password INTO stored_password
  FROM public.users u
  WHERE u.email = verify_user_password.email;

  -- Return true if password matches, false otherwise
  RETURN stored_password = crypt(verify_user_password.password, stored_password);
END;
$$;