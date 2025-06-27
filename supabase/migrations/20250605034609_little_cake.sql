/*
  # Update estimate items RLS policies

  1. Changes
    - Add new RLS policies for estimate_items table to allow:
      - Insert operations for estimate owners and admins
      - Delete operations for estimate owners and admins
      - Update operations for estimate owners and admins
      - Select operations for estimate owners and admins

  2. Security
    - Policies ensure users can only modify estimate items for estimates they own
    - Admins (traffic_admin role) can modify any estimate items
    - All operations are protected by RLS
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to modify estimate items" ON estimate_items;
DROP POLICY IF EXISTS "Allow all users to view estimate items" ON estimate_items;

-- Create new policies
CREATE POLICY "Users can manage their own estimate items"
ON estimate_items
FOR ALL
TO authenticated
USING (
  (auth.uid() = (SELECT owner_id FROM estimates WHERE id = estimate_id)) OR 
  ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
)
WITH CHECK (
  (auth.uid() = (SELECT owner_id FROM estimates WHERE id = estimate_id)) OR 
  ((SELECT role FROM users WHERE id = auth.uid()) = 'traffic_admin')
);