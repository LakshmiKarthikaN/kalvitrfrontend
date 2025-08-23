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
      <div className="flex justify-center">
  <input
    type={type}
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-60 px-2 py-2 border border-gray-300 rounded-2xl focus:outline-none placeholder-gray-500 placeholder:text-xs transition duration-200 ${className}`}
  />
</div>

    </div>
  );
};

export default InputField;