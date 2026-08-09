import React from 'react';
import { FiSearch } from 'react-icons/fi';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search filters or add a new record to get started.',
  icon: Icon = FiSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-200 bg-white rounded-2xl">
      <div className="bg-gray-50 rounded-full p-4 mb-3">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mt-1">{description}</p>
    </div>
  );
};

export default EmptyState;
