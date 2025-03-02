import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import MarkdownEditor from '../components/MarkdownEditor';
import toast from 'react-hot-toast';
import { Image, Save } from 'lucide-react';

interface CreatePostFormData {
  title: string;
  excerpt: string;
  content: string;
  featured_image: FileList;
  published: boolean;
}

const CreatePost: React.FC = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreatePostFormData>();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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
    } else {
      setImagePreview(null);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .concat('-', Date.now().toString().slice(-6));
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${user?.id}/${fileName}`;

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

  const onSubmit = async (data: CreatePostFormData) => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = null;
      if (data.featured_image && data.featured_image[0]) {
        imageUrl = await uploadImage(data.featured_image[0]);
      }

      const slug = generateSlug(data.title);
      
      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: imageUrl,
          author_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published: data.published,
          slug: slug,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success(data.published ? 'Post published successfully!' : 'Draft saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create New Post</h1>
      
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
                onClick={() => {
                  setImagePreview(null);
                  setValue('featured_image', undefined as any);
                }}
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
            Publish immediately (uncheck to save as draft)
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
            disabled={isLoading}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            {isLoading ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;