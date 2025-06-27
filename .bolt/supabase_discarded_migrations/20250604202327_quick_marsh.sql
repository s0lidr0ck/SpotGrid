-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES brands(id),
  name text NOT NULL,
  type text NOT NULL,
  duration interval NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_type CHECK (type IN ('video', 'audio')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT valid_duration CHECK (duration > '0 seconds'::interval)
);

-- Enable RLS
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all users to view media assets"
  ON media_assets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify media assets"
  ON media_assets
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'traffic_admin');

-- Create updated_at trigger
CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();