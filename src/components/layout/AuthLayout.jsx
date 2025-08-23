import React from 'react';
import { Logo } from '../common';

const AuthLayout = ({ 
  children, 
  showIllustration = false, 
  illustration, 
  compact = false, 
  variant = "login"   // 👈 "login" | "register" | "forgot" | "reset"
}) => {
  // Different height for login vs register vs others
  const containerHeight = compact 
    ? "h-[500px]" 
    : (variant === "login" ? "h-[500px]" : "h-auto");

  // ✅ Shared background colors per variant
  const bgColors = {
    login: "bg-[#38B698]",
    register: "bg-[#38B698]",
    forgot: "bg-[#38B698]",
    reset: "bg-[#38B698]"
  };

  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 min-h-screen">
      <div className={`bg-white rounded-lg shadow-lg flex max-w-4xl w-full relative ${containerHeight}`}>
        
        {/* Left Panel */}
        <div 
          className={`w-1/2 p-8 rounded-l-lg flex flex-col items-center justify-center ${bgColors[variant]}`}
        >
          {/* ✅ Case 1: Forgot / Reset → Logo top-left with text beside */}
          {(variant === "forgot" || variant === "reset") ? (
  <div className="absolute top-4 left-4 flex items-center space-x-3">
    {/* Logo image */}
    <div className="w-20 h-20">
      <img src="/src/assets/LogoImg.png" alt="KalviTrack Logo" className="w-full h-full object-contain" />
    </div>

    {/* Title + Subtitle beside logo */}
    <div className="flex flex-col">
      <h1 className="text-black font-bold text-lg leading-none">
        Kalvi<span className="text-white">Track</span>
      </h1>
      <p className="text-white text-xs leading-tight mt-2 left-2">Track, Learn and Achieve</p>
    </div>
  </div>
) : (
  /* Default login/register layout (logo centered) */
  <Logo size={variant === "login" ? "small" : "large"} />
)}

          {/* Illustration only if passed */}
          {illustration && (
            <div className="bg-white p-6  rounded-lg mt-15">
              {illustration}
            </div>
          )}
        </div>
        
        {/* Right Panel */}
        <div className="w-1/2 p-8 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
