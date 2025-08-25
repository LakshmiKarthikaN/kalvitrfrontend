import React from 'react';

const InputField = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name,
  label,
  required = false,
  className = '',
  size = "medium"  // 👈 control width
}) => {
  const sizes = {
    small: "w-3/4 sm:w-2/3 md:w-1/2",
    medium: "w-full sm:w-3/4 md:w-2/3",
    large: "w-full"
  };

  return (
    <div className="space-y-2 flex justify-center">   {/* 👈 centers input */}
      <div className={`flex flex-col ${sizes[size]} mx-auto`}>
        {label && (
          <label className="block text-gray-700 text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`px-3 py-2 border border-gray-300 rounded-2xl 
            focus:outline-none placeholder-gray-500 placeholder:text-xs 
            transition duration-200 ${className}`}
        />
      </div>
    </div>
  );
};

export default InputField;
