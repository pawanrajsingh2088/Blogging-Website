import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { marked } from 'marked';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  published: boolean;
  profiles: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            featured_image,
            created_at,
            updated_at,
            author_id,
            published,
            profiles (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('slug', slug)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Post not found');
        }

        // Check if post is published or if the current user is the author
        if (!data.published && user?.id !== data.author_id) {
          throw new Error('This post is not available');
        }

        setPost(data);
        setHtmlContent(marked(data.content));
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, user]);

  // Set page title and meta description for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | BlogHub`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', post.content.substring(0, 160));
    }
    
    return () => {
      document.title = 'BlogHub';
    };
  }, [post]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error || 'Post not found'}</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const formattedDate = format(new Date(post.created_at), 'MMMM dd, yyyy');
  const isAuthor = user?.id === post.author_id;
  
  // Safely get author information with fallbacks
  const authorName = post.profiles?.full_name || post.profiles?.username || 'Anonymous';
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={18} className="mr-1" />
          Back
        </button>
      </div>
      
      {!post.published && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <p className="text-yellow-800 dark:text-yellow-200">
              This is a draft post and is only visible to you as the author.
            </p>
          </div>
        </div>
      )}
      
      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 mr-3">
                {post.profiles?.avatar_url ? (
                  <img 
                    src={post.profiles.avatar_url} 
                    alt={authorName} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-bold">
                    {authorInitial}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{authorName}</p>
                <p className="text-sm">{formattedDate}</p>
              </div>
            </div>
            
            {isAuthor && (
              <div className="ml-auto">
                <button 
                  onClick={() => navigate(`/edit-post/${post.id}`)}
                  className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  <Edit size={18} className="mr-1" />
                  Edit
                </button>
              </div>
            )}
          </div>
          
          {post.featured_image && (
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            />
          )}
        </header>
        
        <div 
          className="prose dark:prose-invert max-w-none prose-lg prose-indigo"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
};

export default PostDetail;