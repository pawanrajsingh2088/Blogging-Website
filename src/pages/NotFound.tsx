import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
      <p className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Page Not Found</p>
      <p className="text-gray-600 dark:text-gray-300 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/"
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors duration-200"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFound;