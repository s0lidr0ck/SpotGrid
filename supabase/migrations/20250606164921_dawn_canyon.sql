/*
  # Add additional profile fields to users table

  1. Changes
    - Add phone, address, company, and job_title columns to users table
    - These fields will store additional profile information
    
  2. Security
    - Maintain existing RLS policies
    - No changes to authentication or authorization
*/

-- Add new columns to users table for additional profile information
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS job_title text;