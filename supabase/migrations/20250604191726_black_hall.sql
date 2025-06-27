/*
  # Create brands management tables

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `common_name` (text, required)
      - `legal_name` (text, required)
      - `address` (text)
      - `phone` (text)
      - `email` (text)
      - `contact_person` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `brands` table
    - Add policies for authenticated users to:
      - Read all brands
      - Create/update/delete brands (admin only)
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  legal_name text NOT NULL,
  address text,
  phone text,
  email text,
  contact_person text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all users to view brands"
  ON brands
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify brands"
  ON brands
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'traffic_admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'traffic_admin');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();