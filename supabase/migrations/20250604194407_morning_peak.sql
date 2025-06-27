/*
  # Update brands table contact information

  1. Changes
    - Split contact_person into first_name and last_name
    - Add job_title field for contacts
    
  2. Security
    - No changes to existing RLS policies
*/

DO $$ 
BEGIN
  -- Check if contact_person exists before trying to drop it
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'brands' 
    AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE brands DROP COLUMN contact_person;
  END IF;

  -- Add new contact fields if they don't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'brands' 
    AND column_name = 'contact_first_name'
  ) THEN
    ALTER TABLE brands ADD COLUMN contact_first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'brands' 
    AND column_name = 'contact_last_name'
  ) THEN
    ALTER TABLE brands ADD COLUMN contact_last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'brands' 
    AND column_name = 'contact_job_title'
  ) THEN
    ALTER TABLE brands ADD COLUMN contact_job_title text;
  END IF;
END $$;