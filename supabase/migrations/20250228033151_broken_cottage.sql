/*
  # Initial schema setup for blog platform

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `website` (text, nullable)
      - `bio` (text, nullable)
      - `created_at` (timestamptz)
    
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `featured_image` (text, nullable)
      - `author_id` (uuid, references profiles.id)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `published` (boolean)
      - `slug` (text, unique)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public access to published posts
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published BOOLEAN DEFAULT false,
  slug TEXT UNIQUE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Posts policies
-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON posts
  FOR SELECT
  USING (published = true);

-- Authors can view all their own posts (published or drafts)
CREATE POLICY "Authors can view own posts"
  ON posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- Authors can insert their own posts
CREATE POLICY "Authors can insert own posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('blog_images', 'blog_images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('user_avatars', 'user_avatars', true);

-- Set up storage policies
-- Anyone can view blog images
CREATE POLICY "Anyone can view blog images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'blog_images');

-- Anyone can view user avatars
CREATE POLICY "Anyone can view user avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user_avatars');

-- Users can upload their own blog images
CREATE POLICY "Users can upload own blog images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'blog_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own blog images
CREATE POLICY "Users can update own blog images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'blog_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own blog images
CREATE POLICY "Users can delete own blog images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'blog_images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user_avatars' AND
    name = 'avatars/' || auth.uid() || '.jpg' OR
    name = 'avatars/' || auth.uid() || '.png' OR
    name = 'avatars/' || auth.uid() || '.gif'
  );

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'user_avatars' AND
    name = 'avatars/' || auth.uid() || '.jpg' OR
    name = 'avatars/' || auth.uid() || '.png' OR
    name = 'avatars/' || auth.uid() || '.gif'
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user_avatars' AND
    name = 'avatars/' || auth.uid() || '.jpg' OR
    name = 'avatars/' || auth.uid() || '.png' OR
    name = 'avatars/' || auth.uid() || '.gif'
  );