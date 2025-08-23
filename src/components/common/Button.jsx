import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '',
  disabled = false 
}) => {
  const baseClasses = 'py-3 px-6 w-45 rounded-full transition duration-200 font-medium mx-auto block';

  const variants = {
    primary: 'text-white hover:opacity-90 focus:ring-2 ',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    link: 'bg-transparent text-emerald-500 hover:underline p-0'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variant === 'primary' ? { backgroundColor: '#38B698' } : {}}
      className={`${baseClasses} ${variants[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
