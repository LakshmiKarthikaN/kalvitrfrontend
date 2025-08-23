import React, { useState } from 'react';
import { Button, InputField } from '../../components/common';
import { AuthLayout } from '../../components/layout';
import Logo from '../../components/common/Logo';
import ForgotIllustration from '../../assets/forgot.jpeg'; 

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


    
    <img 
      src={ForgotIllustration} 
      alt="Illustration" 
      className="max-w-[250px] max-h-[250px] object-contain mb-5"
    />
  
  );
  
  return (
    <AuthLayout variant="forgot" showIllustration={true} illustration={illustration}>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl text-center font-semibold mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-sm mb-6">Please enter your registered mobile number to get OTP</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleInputChange}
            required
            className="py-1 px-2 w-70 text-sm" 
          />
          
          <InputField
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={formData.otp}
            onChange={handleInputChange}
            required
            className="py-1 px-2 w-70 text-sm" 
          />
          
          {/* Resend OTP + Timer aligned with input */}
          <div className="flex justify-between w-full mt-1 px-15">
            <span className="text-black cursor-pointer underline text-[#38B698]">
              Resend OTP
            </span>
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
              className="!inline !p-0 !m-0 !w-auto align-baseline text-[#38B698] underline"
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
