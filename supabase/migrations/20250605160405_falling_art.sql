/*
  # Add Media and Payment Method Columns to Estimates Table

  1. Changes
    - Add media_asset_id column to link to selected media
    - Add payment_method_id column for selected payment method
    
  2. Security
    - Add foreign key constraint to media_assets table
    - Maintain existing RLS policies
*/

-- Add new columns to estimates table
ALTER TABLE estimates
  ADD COLUMN IF NOT EXISTS media_asset_id uuid REFERENCES media_assets(id),
  ADD COLUMN IF NOT EXISTS payment_method_id text;

-- Create index for media_asset_id for better query performance
CREATE INDEX IF NOT EXISTS estimates_media_asset_id_idx ON estimates(media_asset_id);