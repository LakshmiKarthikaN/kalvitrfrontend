import React, { useState } from 'react';
import { Button, InputField } from '../../components/common';
import { AuthLayout } from '../../components/layout';

const LoginPage = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login data:', formData);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl font-semibold mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          
          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          
          <div className="text-right">
            <button 
              type="button"
              onClick={() => onSwitch('forgot')}
              className="text-gray-600 text-sm hover:text-emerald-500"
            >
              Forgot password?
            </button>
          </div>
          
          <Button type="submit">
            Login
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Button 
              variant="link"
              onClick={() => onSwitch('register')}
            >
              Register here
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
