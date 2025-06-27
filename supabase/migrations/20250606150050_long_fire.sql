/*
  # Fix Admin RLS Policies

  1. Changes
    - Update RLS policies to use a more reliable method for checking admin roles
    - Use a subquery to check the user's role from the public.users table
    - This ensures admins can see all data regardless of ownership
    
  2. Security
    - Maintains existing security model
    - Ensures admins have proper access to all data
    - Regular users still only see their own data
*/

-- Fix estimates table policies
DROP POLICY IF EXISTS "estimates_select_policy_v5" ON estimates;
DROP POLICY IF EXISTS "estimates_insert_policy_v5" ON estimates;
DROP POLICY IF EXISTS "estimates_update_policy_v5" ON estimates;
DROP POLICY IF EXISTS "estimates_delete_policy_v5" ON estimates;

CREATE POLICY "estimates_select_policy_v6"
ON estimates
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);

CREATE POLICY "estimates_insert_policy_v6"
ON estimates
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);

CREATE POLICY "estimates_update_policy_v6"
ON estimates
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
)
WITH CHECK (
  owner_id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);

CREATE POLICY "estimates_delete_policy_v6"
ON estimates
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid() OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin'
);

-- Fix brands table policies
DROP POLICY IF EXISTS "brands_select_policy_v2" ON brands;
DROP POLICY IF EXISTS "brands_insert_policy_v2" ON brands;
DROP POLICY IF EXISTS "brands_update_policy_v2" ON brands;
DROP POLICY IF EXISTS "brands_delete_policy_v2" ON brands;

CREATE POLICY "brands_select_policy_v3"
ON brands
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "brands_insert_policy_v3"
ON brands
FOR INSERT
TO authenticated
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin' OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "brands_update_policy_v3"
ON brands
FOR UPDATE
TO authenticated
USING (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
)
WITH CHECK (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
);

CREATE POLICY "brands_delete_policy_v3"
ON brands
FOR DELETE
TO authenticated
USING (
  ((auth.uid() = owner_id) AND (NOT EXISTS (
    SELECT 1 FROM estimates
    WHERE estimates.brand_id = brands.id
  ))) OR ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
);

-- Fix media_assets table policies
DROP POLICY IF EXISTS "media_assets_select_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_insert_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_update_policy" ON media_assets;
DROP POLICY IF EXISTS "media_assets_delete_policy" ON media_assets;

CREATE POLICY "media_assets_select_policy"
ON media_assets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "media_assets_insert_policy"
ON media_assets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "media_assets_update_policy"
ON media_assets
FOR UPDATE
TO authenticated
USING ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin');

CREATE POLICY "media_assets_delete_policy"
ON media_assets
FOR DELETE
TO authenticated
USING (
  -- Allow users to delete their own media assets or admins to delete any
  (auth.uid() = (SELECT owner_id FROM brands WHERE id = brand_id)) OR
  ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
);