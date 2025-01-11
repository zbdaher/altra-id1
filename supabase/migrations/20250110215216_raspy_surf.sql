/*
  # Fix public access policies

  1. Changes
    - Drop and recreate public access policies with simpler conditions
    - Ensure anonymous access is properly configured
  
  2. Security
    - Maintains read-only access for public profiles
    - Only exposes profiles with url_alias set
*/

-- Recreate the public access policy for profiles
DROP POLICY IF EXISTS "Allow public access to profiles via url_alias" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO public
  USING (url_alias IS NOT NULL);

-- Recreate the public access policy for social links
DROP POLICY IF EXISTS "Allow public access to social links" ON social_links;
CREATE POLICY "Social links are viewable for public profiles"
  ON social_links FOR SELECT
  TO public
  USING (
    user_id IN (
      SELECT user_id FROM profiles 
      WHERE url_alias IS NOT NULL
    )
  );