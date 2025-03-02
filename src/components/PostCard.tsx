import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  featuredImage: string | null;
  authorName: string;
  createdAt: string;
  slug: string;
  published: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  excerpt,
  featuredImage,
  authorName,
  createdAt,
  slug,
  published,
}) => {
  const formattedDate = format(new Date(createdAt), 'MMM dd, yyyy');
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      {featuredImage && (
        <Link to={`/post/${slug}`}>
          <img 
            src={featuredImage} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      
      <div className="p-5">
        {!published && (
          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
            Draft
          </span>
        )}
        
        <Link to={`/post/${slug}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-indigo-600 dark:hover:text-indigo-400">
            {title}
          </h2>
        </Link>
        
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{authorName}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;