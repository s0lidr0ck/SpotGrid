-- Create day_parts table
CREATE TABLE IF NOT EXISTS day_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  spot_frequency integer NOT NULL,
  multiplier numeric(4,2) NOT NULL,
  expected_views integer NOT NULL,
  lowest_cpm numeric(10,2) NOT NULL,
  days integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time),
  CONSTRAINT valid_spot_frequency CHECK (spot_frequency > 0),
  CONSTRAINT valid_multiplier CHECK (multiplier > 0),
  CONSTRAINT valid_expected_views CHECK (expected_views > 0),
  CONSTRAINT valid_lowest_cpm CHECK (lowest_cpm > 0),
  CONSTRAINT valid_days CHECK (days > 0 AND days <= 7)
);

-- Enable RLS
ALTER TABLE day_parts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all users to view day parts"
  ON day_parts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify day parts"
  ON day_parts
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'traffic_admin');

-- Create updated_at trigger
CREATE TRIGGER update_day_parts_updated_at
  BEFORE UPDATE ON day_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default day parts
INSERT INTO day_parts (name, start_time, end_time, spot_frequency, multiplier, expected_views, lowest_cpm, days) VALUES
  ('Over Night', '02:00', '06:00', 8, 0.56, 762, 5.00, 7),
  ('Week Day', '06:00', '17:00', 22, 1.44, 1968, 5.00, 5),
  ('Week End', '06:00', '17:00', 22, 4.45, 6084, 5.00, 2),
  ('Early Fringe', '17:00', '20:00', 6, 2.13, 2908, 5.00, 7),
  ('Prime', '20:00', '23:00', 6, 3.61, 4930, 10.00, 7),
  ('Late Fringe', '23:00', '24:00', 2, 1.67, 2281, 5.00, 7),
  ('Late Night', '00:00', '02:00', 4, 1.00, 1366, 5.00, 7);