import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  created_at: string;
  slug: string;
  published: boolean;
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user) return;
      
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
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('author_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setPosts(data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load your posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user]);

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setPosts(posts.filter(post => post.id !== id));
      toast.success('Post deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Posts</h1>
        <Link 
          to="/create-post"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            You haven't created any posts yet.
          </p>
          <Link 
            to="/create-post"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            <Plus size={18} className="mr-1" />
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                {post.featured_image && (
                  <div className="md:flex-shrink-0">
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="h-48 w-full md:w-48 object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {post.title}
                      </h2>
                      {!post.published && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/edit-post/${post.id}`}
                        className="p-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
                        title="Edit post"
                      >
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400"
                        title="Delete post"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>Created: {new Date(post.created_at).toLocaleDateString()}</span>
                    <Link 
                      to={`/post/${post.slug}`}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Post
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;