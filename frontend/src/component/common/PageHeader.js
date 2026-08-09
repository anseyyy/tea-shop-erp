import React from 'react';

export const PageHeader = ({
  title,
  subtitle,
  action = null,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 mb-6 gap-4 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
