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
    <AuthLayout variant="register">
      <div className="">
        <h2 className="text-[#38B698] text-2xl text-center font-semibold mb-6">
          Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            size
            

          />

          <InputField
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            size
          />

          <InputField
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            size
          />

          <InputField
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            size
          />

          <InputField
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleInputChange}
            required
           size
          />

          <InputField
            type="text"
            name="college"
            placeholder="College Name"
            value={formData.college}
            onChange={handleInputChange}
            required
             size
          />

          <InputField
            type="text"
            name="graduationYear"
            placeholder="Year of Graduation"
            value={formData.graduationYear}
            onChange={handleInputChange}
            required
            size
          />

          {/* Resume Upload */}
          <label className="block text-gray-700 text-sm mb-2">
            Upload your Resume
          </label>

          {/* Hidden file input */}
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Custom label acting as button */}
          <label
            htmlFor="resume-upload"
            className="cursor-pointer w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md text-center hover:bg-gray-50"
          >
            <span className="text-gray-500">Browse</span>
          </label>

          {/* Info text below */}
          <p className="text-xs text-gray-500 mt-2">
            Only PDF, DOC, DOCX allowed.
          </p>

          <div className="text-center">
  <Button type="submit">Register</Button>
</div>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Button
              variant="link"
              onClick={() => onSwitch('login')}
              className="!inline !p-0 !m-0 !w-auto align-baseline text-[#38B698] hover:underline"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegistrationPage;
