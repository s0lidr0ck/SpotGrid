/*
  # Add media assets insert policy

  1. Changes
    - Add INSERT policy for media_assets table to allow authenticated users to upload files
    - Maintain existing policies for SELECT and ALL operations

  2. Security
    - Only authenticated users can insert new media assets
    - Maintains existing RLS policies
*/

-- Add INSERT policy for media_assets table
CREATE POLICY "Allow authenticated users to insert media assets"
  ON media_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);