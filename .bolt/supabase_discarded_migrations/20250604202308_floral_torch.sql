-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
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
CREATE POLICY "Users can view own estimates"
  ON estimates
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role' = 'traffic_admin')
  );

CREATE POLICY "Users can manage own estimates"
  ON estimates
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role' = 'traffic_admin')
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    (auth.jwt() ->> 'role' = 'traffic_admin')
  );

-- Create updated_at trigger
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
CREATE TRIGGER prevent_brand_deletion
  BEFORE DELETE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION check_brand_has_orders();