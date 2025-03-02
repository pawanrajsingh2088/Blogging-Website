import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at: string;
  slug: string;
  published: boolean;
  author_id: string;
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
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
            author_id,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Supabase error:', error.message);
          throw error;
        }

        setPosts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();

    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to BlogHub
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover stories, thinking, and expertise from writers on any topic.
        </p>
      </section>

      {posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            No posts available yet. Be the first to publish!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              featuredImage={post.featured_image}
              authorName={post.profiles?.full_name || post.profiles?.username || 'Anonymous'}
              createdAt={post.created_at}
              slug={post.slug}
              published={post.published}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;