import React from 'react';

export const Select = ({
  label,
  id,
  options = [], // [{ value: '...', label: '...' }]
  value,
  onChange,
  required = false,
  error = '',
  className = '',
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col space-y-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none transition-colors
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
            : 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
          }`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};

export default Select;
