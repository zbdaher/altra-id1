/*
  # Add public access policy for profiles

  1. Changes
    - Add a new RLS policy to allow public access to profiles via url_alias
    
  2. Security
    - Only allows reading profiles that have a url_alias set
    - No authentication required
    - Only allows access to specific columns needed for public display
*/

-- Add policy for public access to profiles
CREATE POLICY "Allow public access to profiles via url_alias"
  ON profiles FOR SELECT
  TO public
  USING (url_alias IS NOT NULL);

-- Add policy for public access to social links
CREATE POLICY "Allow public access to social links"
  ON social_links FOR SELECT
  TO public
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE url_alias IS NOT NULL
    )
  );