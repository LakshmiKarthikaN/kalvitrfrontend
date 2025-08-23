import React from 'react';
import LogoImg from "/home/lakshmikarthika/kalvitrack/src/assets/LogoImg.png";

const Logo = ({ size = 'large', variant = 'dark' }) => {
  const sizes = {
    small: {
      image: 'w-40 h-40',
      title: 'text-lg',
      subtitle: 'text-xs'
    },
    large: {
      image: 'w-40 h-40',
      title: 'text-2xl',
      subtitle: 'text-sm'
    },
    forre: {
      image: 'w-15 h-15'
    }
  };

  const currentSize = sizes[size];

  const textColors = {
    dark: { kalvi: "text-black", track: "text-white", subtitle: "text-white" },
    light: { kalvi: "text-white", track: "text-white", subtitle: "text-white" }
  };

  const colors = textColors[variant];

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Image Logo */}
      <img
        src={LogoImg} 
        alt="KalviTrack Logo"
        className={`${currentSize.image}`}
      />

      {/* App Name: KalviTrack */}
      <h1 className={`font-bold ${currentSize.title} text-center`}>
        <span className={`${colors.kalvi}`}>Kalvi</span>
        <span className={`${colors.track}`}>Track</span>
      </h1>

      {/* Subtitle */}
      <p className={`${colors.subtitle} ${currentSize.subtitle} text-center`}>
        Track, Learn and Achieve
      </p>
    </div>
  );
};

export default Logo;
