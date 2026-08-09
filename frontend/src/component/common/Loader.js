import React from 'react';
import { FiRefreshCw } from 'react-icons/fi';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-6 w-6 text-sm',
    lg: 'h-8 w-8 text-base',
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-2">
      <FiRefreshCw className={`animate-spin text-amber-800 ${currentSize}`} />
      <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">{message}</span>
    </div>
  );
};

export default Loader;
