-- SpotGrid Database Schema
-- Consolidated from Supabase migrations for EasyPanel PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'traffic_admin');
CREATE TYPE estimate_status AS ENUM ('draft', 'pending_approval', 'approved', 'rejected');
CREATE TYPE media_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started', 'incomplete', 'incomplete_expired', 'trialing', 
    'active', 'past_due', 'canceled', 'unpaid', 'paused'
);
CREATE TYPE stripe_order_status AS ENUM ('pending', 'completed', 'canceled');

-- Create users table (replaces auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  role user_role DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
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

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  stripe_payment_method_id text,
  type text NOT NULL,
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Stripe integration tables
CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES users(id) NOT NULL UNIQUE,
  customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT null
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id text UNIQUE NOT NULL,
  subscription_id text DEFAULT null,
  price_id text DEFAULT null,
  current_period_start bigint DEFAULT null,
  current_period_end bigint DEFAULT null,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text DEFAULT null,
  payment_method_last4 text DEFAULT null,
  status stripe_subscription_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz DEFAULT null
);

CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    checkout_session_id text NOT NULL,
    payment_intent_id text NOT NULL,
    customer_id text NOT NULL,
    amount_subtotal bigint NOT NULL,
    amount_total bigint NOT NULL,
    currency text NOT NULL,
    payment_status text NOT NULL,
    status stripe_order_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    deleted_at timestamptz DEFAULT null
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_items_updated_at
  BEFORE UPDATE ON estimate_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create views for Stripe data
CREATE VIEW stripe_user_subscriptions AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4,
    c.user_id
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.deleted_at IS NULL
AND s.deleted_at IS NULL;

CREATE VIEW stripe_user_orders AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date,
    c.user_id
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- Create indexes for performance
CREATE INDEX idx_brands_owner_id ON brands(owner_id);
CREATE INDEX idx_estimates_brand_id ON estimates(brand_id);
CREATE INDEX idx_estimates_owner_id ON estimates(owner_id);
CREATE INDEX idx_estimates_status ON estimates(status);
CREATE INDEX idx_estimate_items_estimate_id ON estimate_items(estimate_id);
CREATE INDEX idx_media_assets_brand_id ON media_assets(brand_id);
CREATE INDEX idx_media_assets_status ON media_assets(status);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id); 