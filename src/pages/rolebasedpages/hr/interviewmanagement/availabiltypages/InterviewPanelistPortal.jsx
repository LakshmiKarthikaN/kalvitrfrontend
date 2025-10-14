import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, Users, Settings, LogOut, Plus, Trash2, Edit, Save, X, AlertCircle } from 'lucide-react';

import { availabilityApi } from '../../../../../api/authApi';
const InterviewPanelistPortal = () => {
  const [activeTab, setActiveTab] = useState('availability');
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({
    sessionId: null,
    remarks: '',
    result: ''
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentAvailabilities, setCurrentAvailabilities] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  useEffect(() => {
    // Load existing availability and assigned students
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Load current availability using real API
      const availabilityResponse = await availabilityApi.getMyAvailability();
      if (availabilityResponse.data.success) {
        setCurrentAvailabilities(availabilityResponse.data.data);
        console.log('Current availabilities loaded:', availabilityResponse.data.data);
      }

      // Load assigned students using real API
      const studentsResponse = await availabilityApi.getAssignedStudents();
      if (studentsResponse.data.success) {
        setAssignedStudents(studentsResponse.data.data);
        console.log('Assigned students loaded:', studentsResponse.data.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 5000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  // Calendar component for date selection
  const generateCalendarDays = () => {
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDates.includes(dateStr);
      const currentDate = new Date(currentYear, currentMonth, day);
      const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      days.push(
        <div
          key={day}
          onClick={() => !isPast && toggleDate(dateStr)}
          className={`h-10 w-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all ${
            isPast
              ? 'text-gray-400 cursor-not-allowed'
              : isSelected
              ? 'bg-emerald-500 text-white shadow-md'
              : 'hover:bg-emerald-100 text-gray-700'
          }`}
        >
          {day}
        </div>
      );
    }
    
    return days;
  };
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const getMonthName = () => {
    return new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };
  const toggleDate = (date) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(prev => prev.filter(d => d !== date));
      const newTimeSlots = { ...timeSlots };
      delete newTimeSlots[date];
      setTimeSlots(newTimeSlots);
    } else {
      setSelectedDates(prev => [...prev, date]);
      setTimeSlots(prev => ({
        ...prev,
        [date]: [{ startTime: '09:00', endTime: '17:00', notes: '' }]
      }));
    }
  };

  const addTimeSlot = (date) => {
    setTimeSlots(prev => ({
      ...prev,
      [date]: [...(prev[date] || []), { startTime: '09:00', endTime: '17:00', notes: '' }]
    }));
  };

  const removeTimeSlot = (date, index) => {
    setTimeSlots(prev => ({
      ...prev,
      [date]: prev[date].filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (date, index, field, value) => {
    setTimeSlots(prev => ({
      ...prev,
      [date]: prev[date].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  const submitAvailability = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Prepare data in the format expected by backend
      const availabilityData = {
        selectedDates: selectedDates,
        timeSlots: timeSlots
      };

      console.log('Submitting availability data:', availabilityData);

      // Use real API call
      const response = await availabilityApi.submitAvailability(availabilityData);

      if (response.data.success) {
        showMessage(response.data.message || 'Availability submitted successfully!', 'success');
        // Clear form
        setSelectedDates([]);
        setTimeSlots({});
        // Reload current availabilities
        await loadData();
      }
    } catch (error) {
      console.error('Error submitting availability:', error);
      showMessage(error.message || 'Failed to submit availability', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addMeetingLink = async (sessionId) => {
    const link = prompt('Enter meeting link:');
    if (link) {
      try {
        // TODO: Implement API call to add meeting link
        // await interviewApi.addMeetingLink(sessionId, link);
        
        // For now, update local state
        setAssignedStudents(prev => 
          prev.map(student => 
            student.sessionId === sessionId 
              ? { ...student, meetingLink: link, status: 'LINK_ADDED' }
              : student
          )
        );
        showMessage('Meeting link added successfully!', 'success');
      } catch (error) {
        showMessage('Failed to add meeting link', 'error');
      }
    }
  };

  const openFeedbackModal = (student) => {
    setFeedbackForm({
      sessionId: student.sessionId,
      remarks: student.remarks || '',
      result: student.result || ''
    });
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    try {
      // TODO: Implement API call to submit feedback
      // await interviewApi.submitFeedback(feedbackForm);
      
      // For now, update local state
      setAssignedStudents(prev => 
        prev.map(student => 
          student.sessionId === feedbackForm.sessionId
            ? { 
                ...student, 
                result: feedbackForm.result,
                remarks: feedbackForm.remarks,
                status: 'COMPLETED'
              }
            : student
        )
      );
      setShowFeedbackModal(false);
      setFeedbackForm({ sessionId: null, remarks: '', result: '' });
      showMessage('Feedback submitted successfully!', 'success');
    } catch (error) {
      showMessage('Failed to submit feedback', 'error');
    }
  };

  const deleteAvailabilitySlot = async (availabilityId) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      setIsLoading(true);
      await availabilityApi.deleteAvailability(availabilityId);
      showMessage('Availability slot deleted successfully!', 'success');
      await loadData(); // Reload data
    } catch (error) {
      showMessage(error.message || 'Failed to delete availability slot', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvailabilitySlot = async (availabilityId, timeSlot) => {
    try {
      setIsLoading(true);
      await availabilityApi.updateAvailability(availabilityId, timeSlot);
      showMessage('Availability updated successfully!', 'success');
      await loadData(); // Reload data
      setEditingSlot(null);
    } catch (error) {
      showMessage(error.message || 'Failed to update availability', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-40 blur-3xl"></div>
        <div className="absolute top-96 -left-32 w-80 h-80 bg-gradient-to-br from-emerald-200 to-green-100 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full opacity-30 blur-2xl"></div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-emerald-100 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-18 py-3">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  KalviTrack
                </h1>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-600 font-medium">Interview Panelist Portal</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <span className="font-semibold text-gray-800 block">
                  {localStorage.getItem('userEmail') || 'Dr. Smith Johnson'}
                </span>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={14} className="text-emerald-500" />
                  <span>{localStorage.getItem('userRole') || 'Faculty'} - Computer Science</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="p-3 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 group"
              >
                <LogOut size={20} className="group-hover:transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative">
        <div className="flex space-x-2 bg-white/90 backdrop-blur-lg p-2 rounded-2xl shadow-xl border border-emerald-100">
          {[
            { id: 'availability', label: 'Set Availability', icon: Calendar, color: 'emerald' },
            { id: 'students', label: 'Assigned Students', icon: Users, color: 'teal' },
            { id: 'current', label: 'Current Availability', icon: Clock, color: 'teal' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group ${
                activeTab === id
                  ? (color === 'emerald' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl transform scale-105'
                      : color === 'teal'
                      ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl transform scale-105'
                      : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-xl transform scale-105')
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/80'
              }`}
            >
              {activeTab === id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
              )}
              <Icon size={20} className={`${activeTab === id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="relative">{label}</span>
              {activeTab === id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            <span className="text-gray-700 font-medium">Processing...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'availability' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-emerald-100 p-8 relative overflow-hidden">
            {/* Decorative elements for availability card */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200 to-green-100 rounded-full opacity-15 translate-y-12 -translate-x-12"></div>
            
            <div className="mb-8 relative">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Calendar className="text-white" size={24} />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Set Your Availability
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                <p className="text-gray-600 text-lg">Select dates and time slots when you're available for interviews</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Calendar */}
              <div className="bg-gradient-to-br from-gray-50 to-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shadow-inner">
  {/* Month Navigation */}
  <div className="flex items-center justify-between mb-4">
    <button
      onClick={goToPreviousMonth}
      className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h4 className="font-bold text-gray-900">{getMonthName()}</h4>
    <button
      onClick={goToNextMonth}
      className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  
  <div className="grid grid-cols-7 gap-2 mb-6">
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="h-12 flex items-center justify-center text-sm font-bold text-gray-700 bg-white/50 rounded-lg">
        {day}
      </div>
    ))}
  </div>
  <div className="grid grid-cols-7 gap-2">
    {generateCalendarDays()}
  </div>
</div>

              {/* Time Slots */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Clock className="text-teal-600" size={18} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Time Slots</h3>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-teal-50/50 p-6 rounded-2xl border border-teal-100 max-h-96 overflow-y-auto custom-scrollbar">
                  {selectedDates.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-4 transform rotate-12">
                        <Clock className="text-emerald-600" size={24} />
                      </div>
                      <p className="text-gray-500 font-medium">Select dates to configure time slots</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDates.map(date => (
                        <div key={date} className="bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                              <h4 className="font-bold text-gray-900 text-lg">
                                {new Date(date).toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </h4>
                            </div>
                            <button
                              onClick={() => addTimeSlot(date)}
                              className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-all duration-200 group"
                            >
                              <Plus size={16} className="group-hover:scale-110 transition-transform" />
                              <span>Add Slot</span>
                            </button>
                          </div>
                          <div className="space-y-3">
                            {(timeSlots[date] || []).map((slot, index) => (
                              <div key={index} className="space-y-3 bg-gray-50/50 p-3 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => updateTimeSlot(date, index, 'startTime', e.target.value)}
                                    className="px-4 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 font-medium"
                                  />
                                  <div className="flex items-center space-x-2">
                                    <div className="w-4 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                                    <span className="text-gray-500 font-medium">to</span>
                                    <div className="w-4 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
                                  </div>
                                  <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => updateTimeSlot(date, index, 'endTime', e.target.value)}
                                    className="px-4 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 font-medium"
                                  />
                                  {(timeSlots[date] || []).length > 1 && (
                                    <button
                                      onClick={() => removeTimeSlot(date, index)}
                                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                    >
                                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={slot.notes || ''}
                                  onChange={(e) => updateTimeSlot(date, index, 'notes', e.target.value)}
                                  placeholder="Add notes (optional)"
                                  className="w-full px-4 py-2 border-2 border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 font-medium"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedDates.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={submitAvailability}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-4 rounded-2xl hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center space-x-3 relative">
                    <Save size={20} />
                    <span>{isLoading ? 'Submitting...' : 'Submit Availability'}</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'current' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-emerald-100 p-8">
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-lg">
                <Clock className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Current Availability
                </h2>
                <p className="text-gray-600">View and manage your existing availability slots</p>
              </div>
            </div>

            {currentAvailabilities.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-3xl flex items-center justify-center mb-6">
                  <Clock className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No availability set</h3>
                <p className="text-gray-500">Set your availability in the "Set Availability" tab.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentAvailabilities.map((slot) => (
                  <div key={slot.availabilityId} className="border-2 border-teal-100 hover:border-teal-300 rounded-xl p-6 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"></div>
                          <span className="font-bold text-lg text-gray-900">
                            {new Date(slot.availableDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric',
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>⏰ {slot.startTime} - {slot.endTime}</span>
                          <span>📝 Duration: {slot.slotDurationMinutes || 60} mins</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            slot.isBooked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {slot.isBooked ? 'BOOKED' : 'AVAILABLE'}
                          </span>
                        </div>
                        {slot.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Notes:</span> {slot.notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!slot.isBooked && (
                          <>
                            <button
                              onClick={() => setEditingSlot(slot)}
                              className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => deleteAvailabilitySlot(slot.availabilityId)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-emerald-100 p-8 relative overflow-hidden">
            {/* Decorative elements for students card */}
            <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full opacity-20 -translate-y-20 -translate-x-20"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-emerald-200 to-teal-100 rounded-full opacity-15 translate-y-16 translate-x-16"></div>
            
            <div className="flex items-center space-x-4 mb-8 relative">
              <div className="p-4 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Assigned Students
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-emerald-600 rounded-full"></div>
                  <p className="text-gray-600">Manage your interview schedule and provide feedback</p>
                </div>
              </div>
            </div>
            
            {assignedStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mb-6 transform rotate-12 hover:rotate-0 transition-transform duration-500">
                  <Users className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No students assigned</h3>
                <p className="text-gray-500">Check back later for interview assignments.</p>
              </div>
            ) : (
              <div className="grid gap-8">
                {assignedStudents.map((student, index) => (
                  <div key={student.sessionId} className="group relative">
                    {/* Decorative number badge */}
                    <div className="absolute -left-4 -top-4 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg z-10">
                      {index + 1}
                    </div>
                    
                    <div className="border-2 border-emerald-100 hover:border-emerald-300 rounded-2xl p-8 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] relative overflow-hidden">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-start justify-between relative">
                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                                  <User className="text-emerald-600" size={18} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900">{student.studentName}</h3>
                              </div>
                              <div className="space-y-3 text-sm">
                                {[
                                  { label: 'Email', value: student.email, icon: '📧' },
                                  { label: 'Mobile', value: student.mobile, icon: '📱' },
                                  { label: 'College', value: student.college, icon: '🏫' }
                                ].map((item) => (
                                  <div key={item.label} className="flex items-center space-x-3 p-2 bg-white/60 rounded-lg">
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-semibold text-gray-700 w-16">{item.label}:</span>
                                    <span className="text-gray-600">{item.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3 text-sm">
                              {[
                                { label: 'Program', value: student.role, icon: '🎓' },
                                { label: 'Graduation', value: student.graduationYear, icon: '📅' },
                                { label: 'Interview Date', value: new Date(student.interviewDate).toLocaleDateString(), icon: '📆' },
                                { label: 'Time', value: `${student.startTime} - ${student.endTime}`, icon: '⏰' }
                              ].map((item) => (
                                <div key={item.label} className="flex items-center space-x-3 p-2 bg-white/60 rounded-lg">
                                  <span className="text-lg">{item.icon}</span>
                                  <span className="font-semibold text-gray-700 w-20">{item.label}:</span>
                                  <span className="text-gray-600">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col items-end space-y-3">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                            student.status === 'COMPLETED' 
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                              : student.status === 'LINK_ADDED'
                              ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white'
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                          }`}>
                            {student.status.replace('_', ' ')}
                          </span>
                          
                          {student.result && (
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold shadow-md ${
                              student.result === 'SELECTED' 
                                ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white'
                                : student.result === 'REJECTED'
                                ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                            }`}>
                              {student.result}
                            </span>
                          )}
                        </div>
                      </div>

                      {student.meetingLink && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100 relative">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-bold text-teal-900">Meeting Link Available</p>
                          </div>
                          <a 
                            href={student.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-teal-600 hover:text-teal-800 text-sm break-all font-medium underline decoration-dotted hover:decoration-solid transition-all"
                          >
                            {student.meetingLink}
                          </a>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3 relative">
                        {!student.meetingLink && student.status === 'SCHEDULED' && (
                          <button
                            onClick={() => addMeetingLink(student.sessionId)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 group"
                          >
                            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span>Add Meeting Link</span>
                          </button>
                        )}
                        
                        {(student.status === 'LINK_ADDED' || student.status === 'COMPLETED') && !student.result && (
                          <button
                            onClick={() => openFeedbackModal(student)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 group"
                          >
                            <FileText size={18} className="group-hover:scale-110 transition-transform duration-300" />
                            <span>Submit Feedback</span>
                          </button>
                        )}
                        
                        {student.result && (
                          <button
                            onClick={() => openFeedbackModal(student)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 group"
                          >
                            <Edit size={18} className="group-hover:scale-110 transition-transform duration-300" />
                            <span>Edit Feedback</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Availability Modal */}
      {editingSlot && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Availability</h3>
              <button 
                onClick={() => setEditingSlot(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Date: {new Date(editingSlot.availableDate).toLocaleDateString()}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={editingSlot.startTime}
                  onChange={(e) => setEditingSlot(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={editingSlot.endTime}
                  onChange={(e) => setEditingSlot(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={editingSlot.notes || ''}
                  onChange={(e) => setEditingSlot(prev => ({...prev, notes: e.target.value}))}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Add any notes..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingSlot(null)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateAvailabilitySlot(editingSlot.availabilityId, {
                  startTime: editingSlot.startTime,
                  endTime: editingSlot.endTime,
                  notes: editingSlot.notes
                })}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 transform animate-in zoom-in-95 duration-300">
            <div className="p-8 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
              
              <div className="flex items-center justify-between mb-8 relative">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                    <FileText className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Interview Feedback
                  </h3>
                </div>
                <button 
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              <div className="space-y-8 relative">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-4">
                    Interview Result *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: 'SELECTED', label: 'Selected', color: 'from-emerald-500 to-green-600', bgColor: 'from-emerald-50 to-green-50' },
                      { value: 'REJECTED', label: 'Rejected', color: 'from-red-500 to-pink-600', bgColor: 'from-red-50 to-pink-50' },
                      { value: 'WAITING_LIST', label: 'Waiting List', color: 'from-yellow-500 to-orange-600', bgColor: 'from-yellow-50 to-orange-50' }
                    ].map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="result"
                          value={option.value}
                          checked={feedbackForm.result === option.value}
                          onChange={(e) => setFeedbackForm(prev => ({...prev, result: e.target.value}))}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          feedbackForm.result === option.value
                            ? `border-transparent bg-gradient-to-r ${option.color} text-white shadow-lg transform scale-105`
                            : `border-gray-200 bg-gradient-to-r ${option.bgColor} hover:border-gray-300 hover:shadow-md`
                        }`}>
                          <div className="text-center font-semibold">
                            {option.label}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-4">
                    Remarks & Feedback
                  </label>
                  <div className="relative">
                    <textarea
                      value={feedbackForm.remarks}
                      onChange={(e) => setFeedbackForm(prev => ({...prev, remarks: e.target.value}))}
                      rows={6}
                      className="w-full px-6 py-4 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-400 font-medium resize-none transition-all duration-300"
                      placeholder="Enter detailed feedback about the candidate's performance, strengths, areas for improvement, technical skills, communication abilities, problem-solving approach, etc."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                      {feedbackForm.remarks.length} characters
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 relative">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-8 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={!feedbackForm.result}
                  className="px-10 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="flex items-center space-x-2 relative">
                    <Save size={18} />
                    <span>Submit Feedback</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPanelistPortal;