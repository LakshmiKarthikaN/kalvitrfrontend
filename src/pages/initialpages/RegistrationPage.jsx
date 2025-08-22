import React, { useState } from 'react';
import { Button, InputField } from '../../components/common';
import { AuthLayout } from '../../components/layout';

const RegistrationPage = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    college: '',
    graduationYear: '',
    resume: null
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      resume: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log('Registration data:', formData);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <h2 className="text-emerald-500 text-2xl font-semibold mb-6">Registration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          
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
          
          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
          
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
            name="college"
            placeholder="College Name"
            value={formData.college}
            onChange={handleInputChange}
            required
          />
          
          <InputField
            type="text"
            name="graduationYear"
            placeholder="Year of Graduation"
            value={formData.graduationYear}
            onChange={handleInputChange}
            required
          />
          
          <div>
            <label className="block text-gray-700 text-sm mb-2">Upload your Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"
            />
          </div>
          
          <Button type="submit">
            Register
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Button 
              variant="link"
              onClick={() => onSwitch('login')}
            >
              Login here
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegistrationPage;