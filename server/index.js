import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Get all published posts
app.get('/api/posts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        excerpt,
        featured_image,
        created_at,
        slug,
        published,
        profiles (
          username,
          full_name
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get a single post by slug
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        excerpt,
        featured_image,
        created_at,
        updated_at,
        author_id,
        published,
        profiles (
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Only return published posts unless the request includes the author's ID
    if (!data.published && req.query.author_id !== data.author_id) {
      return res.status(403).json({ error: 'This post is not available' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;