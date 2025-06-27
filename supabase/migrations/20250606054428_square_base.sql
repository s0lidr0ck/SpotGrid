/*
  # Add rejection reason to estimates table

  1. Changes
    - Add rejection_reason column to estimates table
    - Add check constraint to ensure valid status values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add rejection_reason column
ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update status check constraint to include all possible statuses
DO $$ 
BEGIN
  -- Drop existing status constraint if it exists
  ALTER TABLE estimates DROP CONSTRAINT IF EXISTS valid_status;
  
  -- Add new status constraint with all possible values
  ALTER TABLE estimates
    ADD CONSTRAINT valid_status
    CHECK (status IN ('draft', 'ordered', 'modified', 'approved', 'rejected', 'completed'));
END $$;