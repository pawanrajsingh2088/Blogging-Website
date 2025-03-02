import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              BlogHub
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Share your thoughts with the world
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Navigation
              </h3>
              <div className="mt-2 space-y-2">
                <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Home
                </Link>
                <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Dashboard
                </Link>
                <Link to="/create-post" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Create Post
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Account
              </h3>
              <div className="mt-2 space-y-2">
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Login
                </Link>
                <Link to="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Sign Up
                </Link>
                <Link to="/profile" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 block">
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            &copy; {currentYear} BlogHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;