/*
  # Add unique constraint to profiles table

  1. Changes
    - Add unique constraint on user_id to ensure one profile per user
    - Clean up any duplicate profiles if they exist
  
  2. Security
    - No changes to security policies
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

  -- Add unique constraint
  ALTER TABLE profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);
END $$;