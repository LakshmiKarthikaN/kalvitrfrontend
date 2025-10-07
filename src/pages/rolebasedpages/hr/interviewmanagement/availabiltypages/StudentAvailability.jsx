import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import AvailabilityForm from './AvailabilityForm';

const StudentAvailabilityPage = () => {
  // Get studentId from props, context, or localStorage - adjust as needed
  const studentId = 1; // Replace with actual student ID from your auth system

  const [formData, setFormData] = useState({
    date: '',
    timeFrom: '',
    timeTo: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });
  const [availabilities, setAvailabilities] = useState([]);
  const [hasInterview, setHasInterview] = useState(false);
  
  const [interviewDetails] = useState({
    date: '2025-09-25',
    time: '10:00 AM',
    interviewer: 'Dr. Sarah Johnson',
    status: 'Scheduled'
  });

  // Load existing availabilities on component mount
  useEffect(() => {
    loadAvailabilities();
  }, []);

  const loadAvailabilities = async () => {
    try {
      const response = await ApiService.getStudentAvailability(studentId);
      if (response.success) {
        setAvailabilities(response.data || []);
      }
    } catch (error) {
      console.error('Error loading availabilities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.date || !formData.timeFrom || !formData.timeTo) {
      setSubmitStatus({
        message: 'Please fill in all fields',
        type: 'error'
      });
      return;
    }

    if (formData.timeFrom >= formData.timeTo) {
      setSubmitStatus({
        message: 'End time must be after start time',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setSubmitStatus({ message: '', type: '' });

    try {
      const availabilityData = {
        date: formData.date,
        timeFrom: formData.timeFrom,
        timeTo: formData.timeTo
      };

      const response = await ApiService.submitAvailability(studentId, availabilityData);
      
      if (response.success) {
        setSubmitStatus({
          message: 'Availability submitted successfully!',
          type: 'success'
        });
        
        // Reset form
        setFormData({
          date: '',
          timeFrom: '',
          timeTo: ''
        });
        
        // Reload availabilities
        await loadAvailabilities();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus({ message: '', type: '' });
        }, 3000);
      }
    } catch (error) {
      setSubmitStatus({
        message: error.message || 'Failed to submit availability. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear any previous error messages when user starts typing
    if (submitStatus.type === 'error') {
      setSubmitStatus({ message: '', type: '' });
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (window.confirm('Are you sure you want to delete this availability?')) {
      try {
        await ApiService.deleteAvailability(studentId, availabilityId);
        await loadAvailabilities();
        setSubmitStatus({
          message: 'Availability deleted successfully!',
          type: 'success'
        });
        setTimeout(() => setSubmitStatus({ message: '', type: '' }), 3000);
      } catch (error) {
        setSubmitStatus({
          message: error.message || 'Failed to delete availability',
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-20"></div>
      <div className="absolute top-1/3 right-20 w-8 h-8 bg-teal-300 rounded-full opacity-30"></div>
      
      <div className="w-full max-w-5xl">
        {/* Company Name */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-teal-500">Candidate</span> Portal
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 ">
          {/* Left Panel - Form */}
          <div className=" bg-white rounded-2xl shadow-xl overflow-hidden">
            <AvailabilityForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              submitStatus={submitStatus}
            />
          </div>

          {/* Right Panel - Welcome Section */}
          <div className="bg-gradient-to-br from-teal-400 to-teal-600 p-8 text-white flex flex-col justify-center relative overflow-hidden rounded-2xl shadow-xl">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-white opacity-5 rounded-full"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-4">Hello, Candidate!</h1>
              <div className="w-12 h-1 bg-white mb-6"></div>
              
              <p className="text-lg mb-6 text-teal-50 leading-relaxed">
                Select your preferred date and time slots for the interview. 
                Our coordination team will review your availability and 
                confirm your appointment within 24 hours.
              </p>

              {/* Interview Status */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                {hasInterview ? (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">INTERVIEW SCHEDULED</span>
                    </div>
                    <div className="space-y-2 text-sm text-teal-50">
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span className="font-medium">{interviewDetails.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span className="font-medium">{interviewDetails.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Interviewer:</span>
                        <span className="font-medium">{interviewDetails.interviewer}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">PENDING SCHEDULE</span>
                    </div>
                    <p className="text-sm text-teal-50">
                      Submit your availability to receive interview confirmation.
                    </p>
                  </div>
                )}
              </div>

              {/* Toggle Button for Demo */}
              <button
                onClick={() => setHasInterview(!hasInterview)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-full border border-white/30 hover:bg-white/30 transition duration-200 text-sm"
              >
                Toggle Status (Demo)
              </button>
            </div>
          </div>
        </div>

        {/* Current Availabilities Section */}
        {availabilities.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Current Availabilities</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilities.map((availability) => (
                <div key={availability.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {new Date(availability.availDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {availability.availFrom} - {availability.availTo}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        availability.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : availability.status === 'BOOKED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {availability.status}
                      </span>
                      {availability.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleDeleteAvailability(availability.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                          title="Delete this availability"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition duration-200">
            <Calendar className="w-10 h-10 text-teal-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">FLEXIBLE TIMING</h3>
            <p className="text-sm text-gray-600">
              Choose from multiple time slots that work best with your schedule and preferences.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition duration-200">
            <User className="w-10 h-10 text-teal-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">ONE INTERVIEW</h3>
            <p className="text-sm text-gray-600">
              Each student is eligible for one interview session per application cycle.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition duration-200">
            <Clock className="w-10 h-10 text-teal-500 mx-auto mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">QUICK PROCESS</h3>
            <p className="text-sm text-gray-600">
              Receive confirmation within 24 hours of submitting your availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAvailabilityPage;