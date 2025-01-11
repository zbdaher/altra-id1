/*
  # Initial Schema for AltraID

  1. New Tables
    - profiles
      - id (uuid, primary key)
      - url_alias (text, unique)
      - profile_name (text)
      - occupation (text)
      - profile_image_url (text)
      - profile_image_title (text)
      - cover_image_url (text)
      - description (text)
      - email (text)
      - phone (text)
      - alternate_email (text)
      - alternate_phone (text)
      - location (text)
      - location_url (text)
      - date_of_birth (date)
      - company (text)
      - job_title (text)
      - created_at (timestamp)
      - user_id (uuid, references auth.users)

    - social_links
      - id (uuid, primary key)
      - profile_id (uuid, references profiles)
      - platform (text)
      - url (text)
      - created_at (timestamp)
      - user_id (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url_alias text UNIQUE,
  profile_name text,
  occupation text,
  profile_image_url text,
  profile_image_title text,
  cover_image_url text,
  description text,
  email text,
  phone text,
  alternate_email text,
  alternate_phone text,
  location text,
  location_url text,
  date_of_birth date,
  company text,
  job_title text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Create social_links table
CREATE TABLE social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Social links policies
CREATE POLICY "Users can manage their social links"
  ON social_links FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);