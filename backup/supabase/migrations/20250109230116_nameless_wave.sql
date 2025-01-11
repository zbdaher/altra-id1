/*
  # Fix duplicate user profiles

  1. Changes
    - Remove duplicate profiles keeping only the most recent one per user
    - Ensure unique constraint for user_id
*/

DO $$ 
BEGIN
  -- Delete duplicate profiles keeping only the most recent one
  DELETE FROM profiles a
  WHERE a.id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM profiles 
    ORDER BY user_id, created_at DESC
  );

  -- Drop the constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_user_profile;

  -- Add unique constraint
  ALTER TABLE profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);
END $$;