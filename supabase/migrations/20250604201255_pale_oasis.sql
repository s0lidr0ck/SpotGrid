/*
  # Create estimates table and brand relationships

  1. New Tables
    - `estimates`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key to brands)
      - `estimate_name` (text)
      - `status` (text)
      - `total_estimated_cost` (numeric)
      - `total_spend` (numeric)
      - `start_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on estimates table
    - Add policies for authenticated users and admins
    - Add trigger to prevent deletion of brands with orders

  3. Changes
    - Add foreign key constraint to link estimates to brands
    - Add trigger for updating timestamps
*/

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id),
  estimate_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  total_estimated_cost numeric(10,2) NOT NULL DEFAULT 0,
  total_spend numeric(10,2) NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow all users to view estimates"
  ON estimates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to modify estimates"
  ON estimates
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text)
  WITH CHECK ((auth.jwt() ->> 'role'::text) = 'traffic_admin'::text);

-- Create updated_at trigger for estimates
CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a function to check if brand has orders
CREATE OR REPLACE FUNCTION check_brand_has_orders()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM estimates 
    WHERE brand_id = OLD.id
  ) THEN
    RAISE EXCEPTION 'Cannot delete brand that has associated orders';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent deletion of brands with orders
DROP TRIGGER IF EXISTS prevent_brand_deletion ON brands;
CREATE TRIGGER prevent_brand_deletion
  BEFORE DELETE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION check_brand_has_orders();