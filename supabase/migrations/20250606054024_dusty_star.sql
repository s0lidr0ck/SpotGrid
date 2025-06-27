/*
  # Add reconciliation columns to estimates table

  1. Changes
    - Add `actual_impressions` column to `estimates` table
    - Add `actual_spend` column to `estimates` table
    - Both columns are nullable since they will be populated during reconciliation

  2. Validation
    - `actual_impressions` must be a positive integer when set
    - `actual_spend` must be a positive number with 2 decimal places when set
*/

ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS actual_impressions integer,
ADD COLUMN IF NOT EXISTS actual_spend numeric(10,2);

-- Add check constraints to ensure valid values when set
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'estimates' AND constraint_name = 'valid_actual_impressions'
  ) THEN
    ALTER TABLE estimates 
    ADD CONSTRAINT valid_actual_impressions 
    CHECK (actual_impressions IS NULL OR actual_impressions > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'estimates' AND constraint_name = 'valid_actual_spend'
  ) THEN
    ALTER TABLE estimates 
    ADD CONSTRAINT valid_actual_spend 
    CHECK (actual_spend IS NULL OR actual_spend > 0);
  END IF;
END $$;