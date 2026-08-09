import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import Button from './Button';

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-red-50 border border-red-100 rounded-2xl">
      <div className="bg-red-100 rounded-full p-4 mb-3">
        <FiAlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h3 className="text-sm font-bold text-red-900">{title}</h3>
      <p className="text-xs text-red-700 max-w-sm mt-1 mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
