import React, { useState } from 'react';
import { Button, InputField } from '../../components/common';
import { AuthLayout } from '../../components/layout';

const ForgotPassword = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    mobile: '',
    otp: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSwitch('reset');
  };

  const illustration = (
    <>
      <div className="flex items-center justify-center mb-4">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center relative">
          <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 4V2C7 1.45 7.45 1 8 1S9 1.45 9 2V4H15V2C15 1.45 15.45 1 16 1S17 1.45 17 2V4H20C21.1 4 22 4.9 22 6V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V6C2 4.9 2.9 4 4 4H7ZM20 8H4V20H20V8ZM13 14H16V17H13V14Z"/>
          </svg>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="w-16 h-16 bg-orange-200 rounded-full flex items-center justify-center mx-auto">
        <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
      </div>
    </>
  );

  return (
    <AuthLayout showIllustration={true} illustration={illustration}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl font-semibold mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-6">Please a enter your registered mobile number to get OTP</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleInputChange}
            required
          />
          
          <InputField
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={formData.otp}
            onChange={handleInputChange}
            required
          />
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Resend OTP</span>
            <span className="text-gray-600">5:00</span>
          </div>
          
          <Button type="submit">
            Verify OTP
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Button 
              variant="link"
              onClick={() => onSwitch('register')}
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;