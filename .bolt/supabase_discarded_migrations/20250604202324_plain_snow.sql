-- Create estimate_items table
CREATE TABLE IF NOT EXISTS estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  day_part_id uuid NOT NULL REFERENCES day_parts(id),
  specific_date date NOT NULL,
  user_defined_cpm numeric(10,2) NOT NULL,
  spots_per_occurrence integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_spots CHECK (spots_per_occurrence > 0),
  CONSTRAINT valid_cpm CHECK (user_defined_cpm > 0)
);

-- Enable RLS
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all users to view estimate items"
  ON estimate_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify estimate items"
  ON estimate_items
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'traffic_admin');

-- Create updated_at trigger
CREATE TRIGGER update_estimate_items_updated_at
  BEFORE UPDATE ON estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();