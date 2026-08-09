import React from 'react';

export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, success, danger, outline, ghost
  size = 'md',        // sm, md, lg
  disabled = false,
  className = '',
  icon: Icon = null,
  iconPosition = 'left', // left, right
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-amber-800 text-white hover:bg-amber-900 focus:ring-amber-700 disabled:bg-amber-800/50',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 disabled:text-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-600/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-600/50',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${currentVariant} ${currentSize} ${className} disabled:cursor-not-allowed`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="mr-2 h-4 w-4" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="ml-2 h-4 w-4" />}
    </button>
  );
};

export default Button;
