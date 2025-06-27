/*
  # Update media assets table with additional fields

  1. Changes
    - Add ISCI code field
    - Add friendly name field
    - Add file metadata fields (filename, filesize, timestamp)
    - Add broadcast quality URL field
    
  2. Security
    - Maintain existing RLS policies
    - Add constraints for ISCI code uniqueness
*/

-- Add new columns to media_assets table
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS isci_code text NOT NULL,
  ADD COLUMN IF NOT EXISTS friendly_name text NOT NULL,
  ADD COLUMN IF NOT EXISTS original_filename text NOT NULL,
  ADD COLUMN IF NOT EXISTS filesize bigint NOT NULL,
  ADD COLUMN IF NOT EXISTS file_timestamp timestamptz NOT NULL,
  ADD COLUMN IF NOT EXISTS broadcast_url text;

-- Add ISCI code uniqueness constraint
ALTER TABLE media_assets
  ADD CONSTRAINT unique_isci_code UNIQUE (isci_code);

-- Add constraint for filesize
ALTER TABLE media_assets
  ADD CONSTRAINT valid_filesize CHECK (filesize > 0);