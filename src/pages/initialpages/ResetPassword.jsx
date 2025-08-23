import React, { useState } from 'react';
import { Button, InputField } from '../../components/common';
import { AuthLayout } from '../../components/layout';
import ResetIllustration from '../../assets/reset.jpg';

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
    // TODO: Add password reset API call
    console.log('Password reset submitted', formData);

    // After reset, redirect to login
    onSwitch('login');
  };

  const illustration = (
    <div className="flex items-end justify-center h-full">
      <img 
        src={ResetIllustration}
        alt="Reset Password Illustration"
        className="max-w-[250px] max-h-[250px] object-contain mb-5"
      />
    </div>
  );

  return (
    <AuthLayout variant="reset" showIllustration={true} illustration={illustration}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl text-center font-semibold mb-2">
          Reset Password
        </h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Reset your new password here
        </p>
                
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="password"
            name="newPassword"
            placeholder="Enter New Password"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
            className="py-3 px-4 w-full text-sm"
          />
                  
          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Enter Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="py-3 px-4 w-full text-sm"
          />

          <Button 
            type="submit" 
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg"
          >
            Next
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
