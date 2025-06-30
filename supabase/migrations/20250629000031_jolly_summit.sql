/*
  # Update RLS policies for traffic conditions

  1. Security Changes
    - Update INSERT policy to allow anonymous users to insert traffic conditions
    - This is necessary because traffic conditions are public data that can be contributed by any user
    - The existing SELECT policy already allows public access which is correct
    - Keep the UPDATE policy restricted to authenticated users who own the data

  2. Changes Made
    - Drop the existing restrictive INSERT policy
    - Create a new INSERT policy that allows both authenticated and anonymous users
    - This enables the application to save traffic conditions without requiring authentication
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert traffic conditions" ON traffic_conditions;

-- Create a new INSERT policy that allows both authenticated and anonymous users
CREATE POLICY "Anyone can insert traffic conditions"
  ON traffic_conditions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure the SELECT policy allows public access (should already exist but let's make sure)
DROP POLICY IF EXISTS "Anyone can read traffic conditions" ON traffic_conditions;
CREATE POLICY "Anyone can read traffic conditions"
  ON traffic_conditions
  FOR SELECT
  TO public
  USING (true);