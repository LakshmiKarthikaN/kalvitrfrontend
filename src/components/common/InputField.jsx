
import React, { useState } from "react";
import { useField } from "formik";
import { Eye, EyeOff } from "lucide-react"; 
import { getPasswordStrength } from "../../utils/validatorslogic/passwordStrength";

const InputField = ({ label, required = false, className = "", size = "large", ...props }) => {
  const [field, meta] = useField(props);
  const [showPassword, setShowPassword] = useState(false);

  const sizes = {
    small: "w-3/4 sm:w-2/3 md:w-1/2",
    medium: "w-full sm:w-3/4 md:w-2/3",
    large: "w-full",
  };
  const passwordStrength =
  props.type === "password" ? getPasswordStrength(field.value) : null;

  return (
    <div className="space-y-2 flex justify-center">
      <div className={`flex flex-col ${sizes[size]} mx-auto`}>
        {label && (
          <label className="block text-gray-700 text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

             {/* ✅ wrapper for input + eye icon */}
      <div className="relative">
        <input
          {...field}
          {...props}
          type={showPassword && props.type === "password" ? "text" : props.type}
          className={`border border-gray-300 px-3 py-2 w-full rounded-2xl 
            focus:outline-none placeholder-gray-500 placeholder:text-xs transition duration-200  pr-10`} // pr-10 = space for icon
        />

        {/* 👁 show/hide toggle for password fields only */}
        {props.type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
        {/* <input
          {...field}
          {...props}
          required={required}
          className={`px-3 py-2 border border-gray-300 rounded-2xl 
            focus:outline-none 
            placeholder-gray-500 placeholder:text-xs transition duration-200 
            ${className} ${meta.touched && meta.error ? "border-red-500" : ""}`}
        /> */}

{meta.touched && meta.error && (
        <div className="text-red-500 text-sm mt-1">{meta.error}</div>
      )}

      {/* ✅ Password strength */}
      {props.type === "password" && field.value && (
        <p className={`text-xs mt-1 ${passwordStrength.color}`}>
          Strength: {passwordStrength.label}
        </p>
      )}
    </div>
    </div>
  );
};

export default InputField;
