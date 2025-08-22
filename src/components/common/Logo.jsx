import React from 'react';

const Logo = ({ size = 'large' }) => {
  const sizes = {
    small: {
      container: 'p-2',
      circle: 'w-8 h-8',
      text: 'text-sm',
      title: 'text-lg',
      subtitle: 'text-xs'
    },
    large: {
      container: 'p-4',
      circle: 'w-12 h-12',
      text: 'text-xl',
      title: 'text-2xl',
      subtitle: 'text-sm'
    }
  };

  const currentSize = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className={`bg-white rounded-full ${currentSize.container} mb-6`}>
        <div className={`${currentSize.circle} bg-black rounded-full flex items-center justify-center`}>
          <span className={`text-white font-bold ${currentSize.text}`}>K</span>
        </div>
      </div>
      <h1 className={`text-white ${currentSize.title} font-bold mb-2`}>KalviTrack</h1>
      <p className={`text-white ${currentSize.subtitle}`}>Track, Learn and Achieve</p>
    </div>
  );
};

export default Logo;