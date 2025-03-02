import React, { useState, useEffect } from 'react';
import { marked } from 'marked';

interface MarkdownEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ initialValue, onChange }) => {
  const [markdown, setMarkdown] = useState(initialValue);
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    const html = marked(markdown);
    setPreview(html);
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMarkdown(value);
    onChange(value);
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex border-b dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'write'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          onClick={() => setActiveTab('write')}
        >
          Write
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'preview'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
          }`}
          onClick={() => setActiveTab('preview')}
        >
          Preview
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'write' ? (
          <textarea
            value={markdown}
            onChange={handleChange}
            className="w-full h-64 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write your post content in Markdown..."
          />
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none h-64 p-2 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;