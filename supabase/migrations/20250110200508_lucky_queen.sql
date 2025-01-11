/*
  # Fix social links public access policy

  1. Changes
    - Update the social links public access policy to use user_id instead of profile_id
    - This allows public access to social links based on the user's profile URL alias

  2. Security
    - Maintains security by only allowing access to social links of public profiles
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Allow public access to social links" ON social_links;

-- Create new policy using user_id
CREATE POLICY "Allow public access to social links"
  ON social_links FOR SELECT
  TO public
  USING (
    user_id IN (
      SELECT user_id FROM profiles WHERE url_alias IS NOT NULL
    )
  );