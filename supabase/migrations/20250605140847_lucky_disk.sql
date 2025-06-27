/*
  # Create media assets table

  1. New Tables
    - `media_assets`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `name` (text)
      - `type` (text)
      - `duration` (interval)
      - `status` (text)
      - `url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on media_assets table
    - Add policies for authenticated users to view
    - Add policies for admins to modify
*/

-- Create media_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id),
  name text NOT NULL,
  type text NOT NULL,
  duration interval NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_type'
  ) THEN
    ALTER TABLE media_assets
      ADD CONSTRAINT valid_type CHECK (type IN ('video', 'audio'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_status'
  ) THEN
    ALTER TABLE media_assets
      ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_duration'
  ) THEN
    ALTER TABLE media_assets
      ADD CONSTRAINT valid_duration CHECK (duration > '00:00:00');
  END IF;
END $$;

-- Enable RLS
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to view media assets" ON media_assets;
DROP POLICY IF EXISTS "Allow admins to modify media assets" ON media_assets;

-- Create policies
CREATE POLICY "Allow all users to view media assets"
  ON media_assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify media assets"
  ON media_assets
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_media_assets_updated_at ON media_assets;
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();