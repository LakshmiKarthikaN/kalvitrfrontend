import React from 'react';
import { Logo } from '../common';
import LogoImg from "../../assets/LogoImg.png";

const AuthLayout = ({ 
  children, 
  showIllustration = false, 
  illustration, 
  compact = false, 
  variant = "login"   // "login" | "register" | "forgot" | "reset"
}) => {
  // Different height for login vs register vs others
  const containerHeight = compact 
    ? "h-[500px]" 
    : (variant === "login" ? "h-auto" : "h-auto");

  // Shared background colors per variant
  const bgColors = {
    login: "bg-[#38B698]",
    register: "bg-[#38B698]",
    forgot: "bg-[#38B698]",
    reset: "bg-[#38B698]"
  };

  return (
    <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <div className={`bg-white rounded-lg shadow-lg flex flex-col md:flex-row max-w-4xl w-full relative ${containerHeight}`}>
        
        {/* Left Panel */}
        <div 
          className={`w-full md:w-1/2 p-6 md:p-8 rounded-t-lg md:rounded-l-lg md:rounded-tr-none flex flex-col items-center justify-center relative ${bgColors[variant]}`}
        >
          {/* Forgot / Reset → Logo top-left with text beside */}
          {(variant === "forgot" || variant === "reset") ? (
            <div className="absolute top-4 left-4 flex items-center gap-3">
              {/* Logo image */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex-shrink-0">
                <img 
                  src={LogoImg} 
                  alt="KalviTrack Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>

              {/* Title + Subtitle beside logo */}
              <div className="flex flex-col text-left min-w-0">
                <h1 className="text-black font-bold text-base sm:text-lg md:text-xl lg:text-2xl leading-none truncate">
                  Kalvi<span className="text-white">Track</span>
                </h1>
                <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg leading-tight mt-1 truncate">
                  Track, Learn and Achieve
                </p>
              </div>
            </div>
          ) : (
            /* Default login/register layout (logo centered) */
            <Logo size={variant === "login" ? "small" : "large"} />
          )}

          {/* Illustration if provided */}
          {illustration && (
            <div className="bg-white p-1 md:p-1 rounded-lg mt-10">
              {illustration}
            </div>
          )}
        </div>
        
        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
