 import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
const AddPanelistModal = ({ isOpen, onClose, onSubmit }) => {
   const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

   const resetForm = () => {
     setFormData({
        fullName:'',
        email: '',
        password: ''
      });
      setErrors({});
      setShowPassword(false);
    };
  
    useEffect(() => {
      if (!isOpen) {
        resetForm();
      }
    }, [isOpen]);
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };
  
    const validateForm = () => {
      const newErrors = {};
      if(!formData.fullName.trim()) newErrors.fullName="FullName is required";
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
  
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        setIsSubmitting(true);
        try {
          // The role is automatically set to INTERVIEW_PANELIST in the backend
          await onSubmit({
            fullName : formData.fullName,
            email: formData.email,
            password: formData.password,
            role: 'INTERVIEW_PANELIST'
          });
          setSuccessMessage("Panelist created successfully ✅"); // success message

          onClose();
        } catch (error) {
          console.error('Error creating panelist:', error);
          setErrors({ submit: error.message || 'Failed to create panelist. Please try again.' });
        } finally {
          setIsSubmitting(false);
        }
      }
    };
  
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add Interview Panelist</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
         <form onSubmit={handleSubmit} className="p-6 space-y-6">
         {successMessage && (
    <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded">
      {successMessage}
    </div>
  )}
           {errors.submit && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
                {errors.submit}
              </div>
            )}
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
               Name*
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Due"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.fullName? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="panelist@example.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
  
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters. User will be required to reset on first login.</p>
            </div>
  
         {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
               type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
               >
                Cancel
             </button>
              <button
                type="submit"
                 disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              > 
                {isSubmitting ? "Creating..." : "Add Panelist"}
               </button>
            </div>
       </form>
     </div>
    </div>
  );
  };
export default AddPanelistModal;