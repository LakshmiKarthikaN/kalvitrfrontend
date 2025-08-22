import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '',
  disabled = false 
}) => {
  const baseClasses = 'w-full py-3 rounded-md transition duration-200 font-medium';
  
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    link: 'bg-transparent text-emerald-500 hover:underline p-0'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};

export default Button;