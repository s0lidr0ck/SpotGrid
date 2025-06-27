-- Simplified SpotGrid Database Schema for EasyPanel
-- Core tables without Supabase-specific auth dependencies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'traffic_admin');
CREATE TYPE estimate_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
CREATE TYPE media_status AS ENUM ('pending', 'approved', 'rejected');

-- Create users table (simplified)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role user_role DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  legal_name text NOT NULL,
  address text,
  phone text,
  email text,
  contact_person text,
  owner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create estimates table
CREATE TABLE IF NOT EXISTS estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  brand_id uuid REFERENCES brands(id),
  owner_id uuid REFERENCES users(id),
  status estimate_status DEFAULT 'draft',
  total_amount decimal(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS estimate_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid REFERENCES estimates(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) DEFAULT 0,
  total_price decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media_assets table
CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  brand_id uuid REFERENCES brands(id),
  status media_status DEFAULT 'pending',
  uploaded_by uuid REFERENCES users(id),
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_brands_owner_id ON brands(owner_id);
CREATE INDEX idx_estimates_brand_id ON estimates(brand_id);
CREATE INDEX idx_estimates_owner_id ON estimates(owner_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX idx_media_assets_brand_id ON media_assets(brand_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);

-- Create an admin user
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
  'admin@spotgrid.com', 
  '$2a$12$LQv3c1yqBwEHFgOSLrLXu.A2.xplNKKgjV8wM8Rh2FbCVSZNe4YSu', -- password: "admin123"
  'Admin User', 
  'traffic_admin'
) ON CONFLICT (email) DO NOTHING;

-- Create sample brand
INSERT INTO brands (common_name, legal_name, owner_id)
SELECT 
  'Sample Brand', 
  'Sample Brand LLC', 
  u.id
FROM users u 
WHERE u.email = 'admin@spotgrid.com'
ON CONFLICT DO NOTHING; 