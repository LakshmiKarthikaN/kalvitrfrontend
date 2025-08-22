import React from 'react';
import { Logo } from '../common';

const AuthLayout = ({ children, showIllustration = false, illustration }) => {
  if (showIllustration) {
    // Card layout for forgot password and reset password
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg flex max-w-4xl w-full">
          {/* Left Panel with Illustration */}
          <div className="w-1/2 bg-emerald-500 p-8 rounded-l-lg flex flex-col items-center justify-center">
            <Logo size="small" />
            <div className="bg-white p-6 rounded-lg mt-6">
              {illustration}
            </div>
          </div>
          {/* Right Panel */}
          <div className="w-1/2 p-8 flex items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Split layout for login and registration
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Left Panel */}
      <div className="w-1/2 bg-emerald-500 flex flex-col items-center justify-center p-8">
        <Logo size="large" />
      </div>
      {/* Right Panel */}
      <div className="w-1/2 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;