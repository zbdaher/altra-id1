/*
  # Fix URL alias duplicates

  1. Changes
    - Temporarily remove the unique constraint on url_alias
    - Update duplicate URL aliases to make them unique by appending a number
    - Re-add the unique constraint
*/

DO $$ 
BEGIN
  -- Temporarily drop the unique constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_url_alias_key;

  -- Update duplicate URL aliases
  WITH duplicates AS (
    SELECT url_alias, 
           ROW_NUMBER() OVER (PARTITION BY url_alias ORDER BY created_at) as rnum
    FROM profiles 
    WHERE url_alias IS NOT NULL
  )
  UPDATE profiles p
  SET url_alias = p.url_alias || '-' || d.rnum
  FROM duplicates d
  WHERE p.url_alias = d.url_alias 
    AND d.rnum > 1;

  -- Re-add the unique constraint
  ALTER TABLE profiles ADD CONSTRAINT profiles_url_alias_key UNIQUE (url_alias);
END $$;