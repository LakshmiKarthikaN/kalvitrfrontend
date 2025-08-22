import React, { useState } from 'react';
import { Button, InputField } from "../../components/common";
import { AuthLayout } from '../../components/layout';

const ResetPassword = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle password reset logic here
    console.log('Reset password data:', formData);
  };

  const illustration = (
    <>
      <div className="flex items-center justify-center mb-4">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
      </div>
      <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
        <div className="w-8 h-8 bg-purple-400 rounded-full"></div>
      </div>
    </>
  );

  return (
    <AuthLayout showIllustration={true} illustration={illustration}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl font-semibold mb-2">Reset Password</h2>
        <p className="text-gray-600 text-sm mb-6">Reset your password here</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            name="newPassword"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />
          
          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Enter Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          
          <Button type="submit">
            Reset
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;