import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import MarkdownEditor from '../components/MarkdownEditor';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Image, Save } from 'lucide-react';

interface EditPostFormData {
  title: string;
  excerpt: string;
  content: string;
  featured_image: FileList;
  published: boolean;
}

interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  published: boolean;
  author_id: string;
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<EditPostFormData>();
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('Post not found');
        }

        // Check if the current user is the author
        if (user?.id !== data.author_id) {
          throw new Error('You do not have permission to edit this post');
        }

        setPost(data);
        reset({
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          published: data.published,
        });
        setContent(data.content);
        if (data.featured_image) {
          setImagePreview(data.featured_image);
        }
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.message || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, user, reset]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setValue('content', value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('blog_images')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('blog_images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const onSubmit = async (data: EditPostFormData) => {
    if (!user || !post) {
      toast.error('You must be logged in to edit a post');
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = post.featured_image;
      
      // If a new image was uploaded
      if (data.featured_image && data.featured_image[0]) {
        imageUrl = await uploadImage(data.featured_image[0]);
      }
      
      // If image was removed
      if (!imagePreview && post.featured_image) {
        imageUrl = null;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: imageUrl,
          updated_at: new Date().toISOString(),
          published: data.published,
        })
        .eq('id', post.id);

      if (error) {
        throw error;
      }

      toast.success(data.published ? 'Post updated and published!' : 'Draft updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Edit Post</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            id="title"
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter post title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Excerpt *
          </label>
          <textarea
            id="excerpt"
            {...register('excerpt', { 
              required: 'Excerpt is required',
              maxLength: {
                value: 200,
                message: 'Excerpt must be less than 200 characters'
              }
            })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Brief summary of your post (max 200 characters)"
          />
          {errors.excerpt && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.excerpt.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content *
          </label>
          <MarkdownEditor initialValue={content} onChange={handleContentChange} />
          <input type="hidden" {...register('content', { required: 'Content is required' })} value={content} />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Featured Image
          </label>
          <div className="mt-1 flex items-center">
            <label className="relative cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span className="flex items-center">
                <Image size={18} className="mr-2" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </span>
              <input
                type="file"
                className="sr-only"
                accept="image/*"
                {...register('featured_image')}
                onChange={handleImageChange}
              />
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="ml-3 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-3">
              <img src={imagePreview} alt="Preview" className="h-40 object-cover rounded-md" />
            </div>
          )}
        </div>
        
        <div className="flex items-center">
          <input
            id="published"
            type="checkbox"
            {...register('published')}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Publish (uncheck to save as draft)
          </label>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            {isSaving ? 'Saving...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;