import React from 'react';

const InputField = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name,
  label,
  required = false,
  className = '' 
}) => {
  return (
    <div className="space-y-2">
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
        className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 ${className}`}
      />
    </div>
  );
};

export default InputField;