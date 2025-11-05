import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft, X, Plus,AlertCircle } from 'lucide-react';
// TODO: Uncomment this line in your actual project:
 import { api,availabilityApi, interviewerApi, studentApi,interviewApi} from '../../../../api/authApi';

const HRInterviewScheduler = ({ onBack }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedDaySlots, setSelectedDaySlots] = useState(null);
  const [slotDuration, setSlotDuration] = useState(60);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [students, setStudents] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };
  useEffect(() => {
    fetchAllData();
    loadScheduledInterviews();

  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // REPLACE WITH YOUR ACTUAL API CALLS:
      const studentsResponse = await studentApi.getStudentsByRole('PMIS');
      const pmisStudents = studentsResponse.data.data || studentsResponse.data || [];
    
      // ✅ ADD THESE TWO LINES HERE (right after the API call)
      const activeStudents = pmisStudents
        .filter(s => s.status === 'ACTIVE' && s.emailVerified)
        .map(s => ({
          id: s.id,
          name: s.fullName,
          email: s.email,
          role: s.role,
          mobile: s.mobileNumber,
          college: s.collegeName
        }));
      
      setStudents(activeStudents);
      
      // Fetch all users and filter for interviewers only
      const usersResponse = await api.get("/users");
      
      // Handle multiple possible response structures
      let allUsers = [];
      if (Array.isArray(usersResponse.data)) {
        allUsers = usersResponse.data;
      } else if (usersResponse.data?.data && Array.isArray(usersResponse.data.data)) {
        allUsers = usersResponse.data.data;
      } else if (usersResponse.data?.users && Array.isArray(usersResponse.data.users)) {
        allUsers = usersResponse.data.users;
      } else {
        console.error('Unexpected users response structure:', usersResponse.data);
        allUsers = [];
      }
      
      
      // Filter only INTERVIEW_PANELIST and FACULTY roles
      // Filter only INTERVIEW_PANELIST and FACULTY roles
      const interviewerList = allUsers
      .filter(user => {
        const isActiveStatus = user.status === 'ACTIVE';
        const isInterviewerRole = user.role === 'INTERVIEW_PANELIST' || user.role === 'FACULTY';
        return isActiveStatus && isInterviewerRole;
      })
      .map(p => {
        const userId = p.userId || p.user_id || p.id;
        
        return {
          id: userId,
          userId: userId,
          name: p.fullName || p.full_name,
          email: p.email,
          role: p.role
        };
      });
      const interviewerResponse = await interviewerApi.getAllInterviewers(); // Or whatever your API is
const actualInterviewers = interviewerResponse.data.data || interviewerResponse.data;

      const userIdToInterviewerIdMap = {};
      actualInterviewers.forEach(interviewer => {
        userIdToInterviewerIdMap[interviewer.userId] = interviewer.interviewerId;
      });
      

// Now add interviewerId to your interviewerList
const enhancedInterviewerList = interviewerList.map(interviewer => ({
  ...interviewer,
  interviewerId: userIdToInterviewerIdMap[interviewer.userId]
}));

setInterviewers(enhancedInterviewerList);
      
     
      setInterviewers(interviewerList);
      const slotsResponse = await availabilityApi.getAvailableSlots();
      const slotsData = slotsResponse.data.data || slotsResponse.data || [];
      
      
      const formattedSlots = slotsData
  .flatMap(dayGroup => {
  

    // ✅ Find interviewer by userId (not by id)
    const interviewer = interviewerList.find(i => i.userId === dayGroup.userId);
    
    if (!interviewer) {
      return [];
    }
    
    // Map each individual slot from the slots array
    return dayGroup.slots.map(slot => ({
      id: parseInt(slot.availabilityId),
      interviewerId: dayGroup.interviewerId, // ✅ Use the interviewerId from API
      userId: dayGroup.userId, // ✅ Keep userId for reference
      interviewerName: dayGroup.interviewerName || interviewer.name,
      date: dayGroup.date,
      startTime: slot.startTime.substring(0, 5),
      endTime: slot.endTime.substring(0, 5),
      duration: parseInt(slot.duration),
      notes: dayGroup.notes || ''
    }));
  })
  .filter(slot => slot !== null);

console.log("📊 Formatted Slots:", formattedSlots); // ✅ Add this to verify
setAvailableSlots(formattedSlots);

      if (formattedSlots.length > 0) {
        const earliestSlotDate = new Date(Math.min(...formattedSlots.map(s => new Date(s.date))));
        const today = new Date();
        const weeksDiff = Math.floor((earliestSlotDate - today) / (7 * 24 * 60 * 60 * 1000));
        setCurrentWeek(weeksDiff);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  const loadScheduledInterviews = async () => {
    try {
      const response = await interviewApi.getAllScheduledInterviews();
      if (response.data.success) {
        const formattedInterviews = response.data.data.map(interview => ({
          id: interview.sessionId,
          studentId: interview.studentId,
          studentName: interview.studentName,
          studentEmail: interview.studentEmail,
          interviewerId: interview.interviewerId,
          interviewerName: interview.interviewerName,
          date: interview.date,
          startTime: interview.startTime,
          endTime: interview.endTime,
          status: interview.status
        }));
        
        setScheduledInterviews(formattedInterviews);
        
        // Mark booked slots
        const booked = formattedInterviews.map(i => ({
          date: i.date,
          interviewerId: i.interviewerId,
          startTime: i.startTime,
          endTime: i.endTime
        }));
        setBookedSlots(booked);
      }
    } catch (error) {
      console.error('Error loading scheduled interviews:', error);
    }
  };
  useEffect(() => {
    if (slotDuration) {
      fetchAllData();
    }
  }, [slotDuration]);
  const getWeekDates = () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (currentWeek * 7));
    
    const dates = [];
    let currentDate = new Date(startDate);
    
    // Generate 5 weekdays starting from startDate, skipping weekends
    while (dates.length < 7) {
      
      // Skip Saturday (6) and Sunday (0)
      
        dates.push(new Date(currentDate));
      
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };
  

  const weekDates = getWeekDates();

  const splitIntoSlots = (startTime, endTime, duration) => {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    while (currentMinutes + duration <= endMinutes) {
      const slotStartHour = Math.floor(currentMinutes / 60);
      const slotStartMin = currentMinutes % 60;
      const slotEndMinutes = currentMinutes + duration;
      const slotEndHour = Math.floor(slotEndMinutes / 60);
      const slotEndMin = slotEndMinutes % 60;
      
      slots.push({
        start: `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`,
        end: `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`
      });
      
      currentMinutes += duration;
    }
    
    return slots;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  const getAvailabilitySummary = (date, interviewerId) => {
    const dateStr = formatDate(date);
    
    // ✅ Filter by userId (which is stored as interviewerId in your interviewer state)
    const slots = availableSlots.filter(slot => {
      const dateMatch = slot.date === dateStr;
      const interviewerMatch = slot.userId === interviewerId; // ✅ Changed from slot.interviewerId
      
      
      return dateMatch && interviewerMatch;
    });
    
    
    if (slots.length === 0) return null;
    
    // Filter out booked slots
    const availableSlotsList = slots.filter(slot => {
      return !bookedSlots.some(booked => 
        booked.date === dateStr && 
        booked.userId === interviewerId && // ✅ Match by userId
        booked.startTime === slot.startTime
      );
    });
    
    return {
      total: availableSlotsList.length,
      slots: availableSlotsList.map(slot => ({
        start: slot.startTime,
        end: slot.endTime,
        id: slot.id
      })),
      rawBlocks: slots
    };
  };
  const handleCellClick = (date, interviewer) => {
    const summary = getAvailabilitySummary(date, interviewer.id);
    if (summary && summary.total > 0) {
      setSelectedDaySlots({
        date: formatDate(date),
        dateDisplay: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        interviewer,
        slots: summary.slots,
        rawBlocks: summary.rawBlocks, // ✅ Make sure this includes interviewerId
        actualInterviewerId: summary.rawBlocks[0]?.interviewerId // ✅ Add this
      });
      setShowSlotModal(true);
    }
  };
  const bookSlot = async () => {
    if (!selectedStudent || !selectedDaySlots || !selectedSlot) {
      showToast('Please select a student and time slot', 'error');
      return;
    }
    
    setIsScheduling(true);
  
    try {
      const rawBlock = selectedDaySlots.rawBlocks[0];
      const actualInterviewerId = rawBlock.interviewerId;
      
      if (!selectedStudent.id) {
        console.error('❌ Student ID is missing:', selectedStudent);
        showToast('Invalid student selection. Please refresh and try again.', 'error');
        setIsScheduling(false);
        return;
      }
  
      // ✅ Find the matching availability slot from rawBlocks
      const matchingSlot = selectedDaySlots.rawBlocks.find(block => 
        block.startTime === selectedSlot.start && block.endTime === selectedSlot.end
      );
  
      if (!matchingSlot || !matchingSlot.id) {
        console.error('❌ Could not find availability ID for slot:', selectedSlot);
        showToast('Invalid slot selection. Please try again.', 'error');
        setIsScheduling(false);
        return;
      }
  
      const scheduleData = {
        studentId: selectedStudent.id,
        interviewerId: actualInterviewerId,
        availabilityId: parseInt(matchingSlot.id), // ✅ Use the id from rawBlocks
        date: selectedDaySlots.date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        remarks: ''
      };
      
      console.log('📤 Scheduling interview:', scheduleData);
      
      // Call the API to schedule the interview
      const response = await interviewApi.scheduleInterview(scheduleData);
      
      if (response.data.success) {
        showToast('✅ Interview scheduled successfully!', 'success');
        
        // Add to booked slots
        setBookedSlots([...bookedSlots, {
          date: selectedDaySlots.date,
          interviewerId: actualInterviewerId,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end
        }]);
        
        // Reset and close
        setSelectedSlot(null);
        setShowSlotModal(false);
        
        // Refresh data
        await loadScheduledInterviews();
        await fetchAllData();
      } else {
        showToast(response.data.message || 'Failed to schedule interview', 'error');
      }
    } catch (error) {
      console.error('❌ Error scheduling interview:', error);
      showToast(error.response?.data?.message || 'Failed to schedule interview. Please try again.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notScheduled = !scheduledInterviews.some(si => si.studentId === student.id);
    return matchesSearch && notScheduled;
  });

  const handleCancelInterview = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) {
      return;
    }
  
    try {
      const response = await interviewApi.cancelInterview(scheduleId);
      
      if (response.data.success) {
        const schedule = scheduledInterviews.find(si => si.id === scheduleId);
        if (schedule) {
          setBookedSlots(bookedSlots.filter(b => 
            !(b.date === schedule.date && 
              b.interviewerId === schedule.interviewerId && 
              b.startTime === schedule.startTime)
          ));
          setScheduledInterviews(scheduledInterviews.filter(si => si.id !== scheduleId));
        }
        
        // Refresh data
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      alert(error.response?.data?.message || 'Failed to cancel interview');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <X size={48} className="mx-auto mb-2" />
            <h2 className="text-xl font-bold">Error Loading Data</h2>
          </div>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="w-full py-2 px-4 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-3 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4 border-l-4 border-teal-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="w-full md:w-auto">
            <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-200 mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Calendar className="text-teal-500" size={28} />
                Interview Scheduler
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">Select a student, then click available slots to schedule</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="text-center bg-teal-50 rounded-lg px-4 py-2 flex-1 md:flex-none">
                <div className="text-2xl font-bold text-teal-600">{filteredStudents.length}</div>
                <div className="text-xs text-gray-600">Available</div>
              </div>
              <div className="text-center bg-cyan-50 rounded-lg px-4 py-2 flex-1 md:flex-none">
                <div className="text-2xl font-bold text-cyan-600">{scheduledInterviews.length}</div>
                <div className="text-xs text-gray-600">Scheduled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'schedule'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Schedule Interviews
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'scheduled'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Scheduled ({scheduledInterviews.length})
            </button>
          </div>
        </div>

        {activeTab === 'schedule' ? (
          <>
            {/* Horizontal Student Section - Always Above Calendar */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="text-teal-500" size={24} />
                    Students ({filteredStudents.length})
                  </h2>
                  {selectedStudent && (
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs md:text-sm px-3 py-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm md:text-base"
                  />
                </div>

                {/* Horizontal Scrollable Student Cards */}
                <div className="relative">
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-teal-300 scrollbar-track-gray-100">
                {filteredStudents.map(student => (
                     <div
                     key={student.id}
                     onClick={() => setSelectedStudent(student)}
                     className={`relative overflow-hidden cursor-pointer transition-all duration-300 rounded-lg group flex-shrink-0 w-72 sm:w-80 ${
                       selectedStudent?.id === student.id
                         ? 'ring-2 ring-teal-500 shadow-xl scale-105'
                         : 'hover:shadow-lg hover:scale-102'
                     }`}
                   >
                      {/* Background Pattern */}
                      
                      <div className={` inset-0 opacity-10 ${
                        selectedStudent?.id === student.id ? 'bg-teal-500' : 'bg-gray-200'
                      }`}>
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }}></div>
                      </div>

                      <div className={`relative p-4 ${
                        selectedStudent?.id === student.id
                          ? 'bg-white'
                          : 'bg-white group-hover:bg-gray-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          {/* Left Border Accent */}
                          <div className={`w-1 h-16 rounded-full transition-all duration-300 ${
                            selectedStudent?.id === student.id
                              ? 'bg-gradient-to-b from-teal-500 to-cyan-500'
                              : 'bg-gray-300 group-hover:bg-teal-400'
                          }`}></div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-sm mb-1 truncate ${
                                  selectedStudent?.id === student.id ? 'text-teal-700' : 'text-gray-800'
                                }`}>
                                  {student.name}
                                </h3>
                                <p className="text-xs text-gray-600 truncate mb-2">{student.email}</p>
                              </div>
                              
                              {selectedStudent?.id === student.id && (
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                                  <CheckCircle className="text-white" size={14} />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                                selectedStudent?.id === student.id
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {student.role}
                              </span>
                              {selectedStudent?.id === student.id && (
                                <span className="text-xs text-teal-600 font-semibold">
                                  • Active
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Accent Line */}
                      <div className={`h-1 transition-all duration-300 ${
                        selectedStudent?.id === student.id
                          ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500'
                          : 'bg-transparent group-hover:bg-gray-300'
                      }`}></div>
                    </div>
                  ))}
                </div>
                </div>
                {selectedStudent && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-teal-600" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-teal-800">
                          {selectedStudent.name} selected
                        </p>
                        <p className="text-xs text-teal-600">
                          Click on available slots in the calendar below to schedule an interview
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <User size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-base md:text-lg font-semibold">No students found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                  className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                  className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="border border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-3 text-left font-semibold min-w-[150px]">
                        Interviewer
                      </th>
                      {weekDates.map((date, idx) => (
                        <th key={idx} className="border border-gray-200 bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-3 text-center font-semibold min-w-[140px]">
                          <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="text-sm font-normal">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {interviewers.map(interviewer => (
                      <tr key={interviewer.id}>
                        <td className="border border-gray-200 p-4 bg-gray-50 font-semibold">
                          <div className="text-gray-800">{interviewer.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{interviewer.role}</div>
                        </td>
                        {weekDates.map((date, idx) => {
                          const summary = getAvailabilitySummary(date, interviewer.id);
                          const hasSlots = summary && summary.total > 0;
                          
                          return (
                            <td 
                              key={idx} 
                              className={`border border-gray-200 p-3 align-top min-h-[100px] transition-all ${
                                hasSlots && selectedStudent ? 'bg-teal-50 cursor-pointer hover:bg-teal-100' : hasSlots ? 'bg-gray-50' : 'bg-white'
                              }`}
                              onClick={() => hasSlots && selectedStudent && handleCellClick(date, interviewer)}
                            >
                              {hasSlots ? (
                                <div className="text-center">
                                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500 text-white font-bold text-lg mb-2">
                                    {summary.total}
                                  </div>
                                  <p className="text-xs text-teal-700 font-semibold">{summary.total} slot{summary.total !== 1 ? 's' : ''}</p>
                                  {selectedStudent && (
                                    <button className="mt-2 text-xs px-3 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600">
                                      Select Slot
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center text-gray-400 text-sm">No slots</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle className="text-teal-500" size={24} />
              Scheduled Interviews
            </h2>

            {scheduledInterviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No interviews scheduled yet</p>
                <p className="text-sm">Select a student and click on available slots to schedule interviews</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledInterviews.map(interview => (
                  <div key={interview.id} className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Student</p>
                          <p className="font-bold text-gray-800">{interview.studentName}</p>
                          <p className="text-sm text-gray-600">{interview.studentEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Interviewer</p>
                          <p className="font-bold text-gray-800">{interview.interviewerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Date</p>
                          <p className="font-bold text-gray-800">
                            {new Date(interview.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Time</p>
                          <p className="font-bold text-gray-800">{interview.startTime} - {interview.endTime}</p>
                        </div>
                      </div>
                      <button onClick={() => handleCancelInterview(interview.id)}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    {/* Slot Selection Modal */}
    {showSlotModal && selectedDaySlots && (
  <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Select Time Slot</h3>
            <p className="text-teal-100">{selectedDaySlots.dateDisplay}</p>
            <p className="text-sm text-teal-100 mt-1">
              Interviewer: {selectedDaySlots.interviewer.name}
            </p>
          </div>
          <button
            onClick={() => {
              setShowSlotModal(false);
              setSelectedSlot(null);
            }}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
        {selectedStudent && (
          <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-teal-800 mb-2">Scheduling for:</p>
            <p className="font-bold text-gray-800">{selectedStudent.name}</p>
            <p className="text-sm text-gray-600">{selectedStudent.email}</p>
          </div>
        )}

        {/* Slot Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedDaySlots.slots.map((slot, index) => (
            <button
              key={index}
              onClick={() => setSelectedSlot(slot)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left group ${
                selectedSlot?.start === slot.start && selectedSlot?.end === slot.end
                  ? 'border-teal-500 bg-teal-50 shadow-lg ring-2 ring-teal-200'
                  : 'border-teal-300 bg-white hover:bg-teal-50 hover:border-teal-500 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
                    <Clock size={20} />
                    {slot.start} - {slot.end}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedDaySlots.rawBlocks[0]?.duration || slotDuration} minutes
                  </p>
                </div>
                {selectedSlot?.start === slot.start && selectedSlot?.end === slot.end ? (
                  <CheckCircle
                    className="text-teal-500"
                    size={24}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-teal-300 group-hover:border-teal-500 transition-colors"></div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* No Slots */}
        {selectedDaySlots.slots.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock size={48} className="mx-auto mb-4 text-gray-300" />
            <p>All slots for this day have been booked</p>
          </div>
        )}

        {/* Schedule Button - Shows only when slot is selected */}
        {selectedSlot && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={bookSlot}
              disabled={isScheduling}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScheduling ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar size={20} />
                  Schedule Interview
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* Toast Notification */}
{toast.show && (
  <div className="fixed top-4 right-4 z-[60] animate-slide-in">
    <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl ${
      toast.type === 'success' 
        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
        : 'bg-gradient-to-r from-red-500 to-rose-500'
    } text-white min-w-[300px]`}>
      {toast.type === 'success' ? (
        <CheckCircle size={24} className="flex-shrink-0" />
      ) : (
        <AlertCircle size={24} className="flex-shrink-0" />
      )}
      <p className="flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => setToast({ show: false, message: '', type: '' })}
        className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors flex-shrink-0"
      >
        <X size={18} />
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default HRInterviewScheduler;