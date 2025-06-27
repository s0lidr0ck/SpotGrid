/*
  # Create Day Parts and Estimate Items Tables

  1. New Tables
    - `day_parts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `start_time` (time)
      - `end_time` (time)
      - `spot_frequency` (integer)
      - `multiplier` (numeric)
      - `expected_views` (integer)
      - `lowest_cpm` (numeric)
      - `days` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `estimate_items`
      - `id` (uuid, primary key)
      - `estimate_id` (uuid, references estimates)
      - `day_part_id` (uuid, references day_parts)
      - `specific_date` (date)
      - `user_defined_cpm` (numeric)
      - `spots_per_occurrence` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and modifying data
*/

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
ALTER TABLE day_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_items ENABLE ROW LEVEL SECURITY;

-- Add policies for day_parts
CREATE POLICY "Allow all users to view day parts"
  ON day_parts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify day parts"
  ON day_parts
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Add policies for estimate_items
CREATE POLICY "Allow all users to view estimate items"
  ON estimate_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify estimate items"
  ON estimate_items
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create updated_at triggers
CREATE TRIGGER update_day_parts_updated_at
  BEFORE UPDATE ON day_parts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_items_updated_at
  BEFORE UPDATE ON estimate_items
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