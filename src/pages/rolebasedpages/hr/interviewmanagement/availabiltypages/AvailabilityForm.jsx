import React, { useState } from 'react';
import { Calendar, Clock, User } from 'lucide-react';

  
  {/* Left Panel - Form Section */}
const AvailabilityForm = ({formData,handleInputChange,handleSubmit,isLoading,submitStatus}) =>{
    return (
  <div className="p-12 flex flex-col justify-center">
  <div className="text-center mb-8">
    <h2 className="text-3xl font-bold text-teal-500 mb-4">Set Your Availability</h2>
    <div className="w-12 h-1 bg-teal-500 mx-auto mb-6"></div>
    
    {/* Social media style icons */}
    <div className="flex justify-center space-x-4 mb-6">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-50 cursor-pointer transition duration-200">
        <Calendar className="w-5 h-5 text-gray-600" />
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-50 cursor-pointer transition duration-200">
        <Clock className="w-5 h-5 text-gray-600" />
      </div>
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-50 cursor-pointer transition duration-200">
        <User className="w-5 h-5 text-gray-600" />
      </div>
    </div>
    
    <p className="text-gray-500 text-sm mb-8">Select your preferred interview schedule</p>
  </div>
        {/* Status Messages */}
        {submitStatus.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          submitStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {submitStatus.type === 'success' ? 
            <CheckCircle className="w-5 h-5" /> : 
            <AlertCircle className="w-5 h-5" />
          }
          <span className="text-sm">{submitStatus.message}</span>
        </div>
      )}


  {/* Availability Form */}
  <form onSubmit={handleSubmit} className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        min={new Date().toISOString().split('T'[0])}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 text-gray-700"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Available From</label>
      <input
        type="time"
        name="timeFrom"
        value={formData.timeFrom}
        onChange={handleInputChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 text-gray-700"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Available To</label>
      <input
        type="time"
        name="timeTo"
        value={formData.timeTo}
        onChange={handleInputChange}
        required
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 text-gray-700"
      />
    </div>
    <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-lg ${
            isLoading 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-teal-500 text-white hover:bg-teal-600'
          }`}
        >
          {isLoading ? 'Submitting...' : 'Submit Availability'}
        </button>
   


   
  </form>
</div>
    );
};
export default AvailabilityForm;