import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Search, CheckCircle, ChevronLeft, ChevronRight, ArrowLeft, X, Plus } from 'lucide-react';
// TODO: Uncomment this line in your actual project:
 import { api,availabilityApi, interviewerApi, studentApi } from '../../../../api/authApi';

const HRInterviewScheduler = ({ onBack }) => {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedDaySlots, setSelectedDaySlots] = useState(null);
  const [slotDuration, setSlotDuration] = useState(60);

  const [students, setStudents] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // REPLACE WITH YOUR ACTUAL API CALLS:
      const studentsResponse = await studentApi.getStudentsByRole('PMIS');
      const pmisStudents = studentsResponse.data.data || studentsResponse.data || [];
      
      const activeStudents = pmisStudents
        .filter(s => s.status === 'ACTIVE' && s.emailVerified)
        .map(s => ({
          id: s.studentId,
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
      
      console.log('Total users fetched:', allUsers.length);
      console.log('Raw response structure:', Object.keys(usersResponse.data || {}));
      
      // Filter only INTERVIEW_PANELIST and FACULTY roles
      const interviewerList = allUsers
        .filter(user => {
          const isActiveStatus = user.status === 'ACTIVE';
          const isInterviewerRole = user.role === 'INTERVIEW_PANELIST' || user.role === 'FACULTY';
          return isActiveStatus && isInterviewerRole;
        })
        .map(p => {
          const interviewerId = p.interviewerId || p.interviewer_id;
          const userId = p.userId || p.user_id || p.id;
          
          return {
            id: userId,
            interviewerId: interviewerId,
            name: p.fullName || p.full_name,
            email: p.email,
            role: p.role
          };
        });
      
      console.log('Active interviewers (INTERVIEW_PANELIST + FACULTY):', interviewerList.length);
      console.log('Breakdown:', {
        panelists: interviewerList.filter(i => i.role === 'INTERVIEW_PANELIST').length,
        faculty: interviewerList.filter(i => i.role === 'FACULTY').length
      });
      
      setInterviewers(interviewerList);
      const slotsResponse = await availabilityApi.getAvailableSlots();
      const slotsData = slotsResponse.data.data || slotsResponse.data || [];
      
      console.log('Raw slots response:', slotsData);
      
      const formattedSlots = slotsData
        .flatMap(dayGroup => {
          // Each dayGroup now contains: {interviewerId, userId, date, totalSlots, slots: [...]}
          const interviewer = interviewerList.find(i => i.id === dayGroup.userId);
          
          if (!interviewer) {
            console.warn(`⚠️ No interviewer found for userId: ${dayGroup.userId}`);
            return [];
          }
          
          // Map each individual slot from the slots array
          return dayGroup.slots.map(slot => ({
            id: parseInt(slot.availabilityId),
            interviewerId: dayGroup.userId,
            interviewerName: dayGroup.interviewerName || interviewer.name,
            date: dayGroup.date,
            startTime: slot.startTime.substring(0, 5), // Now safe to use substring
            endTime: slot.endTime.substring(0, 5),
            duration: parseInt(slot.duration),
            notes: dayGroup.notes || ''
          }));
        })
        .filter(slot => slot !== null);
      
      console.log('Formatted slots:', formattedSlots.length);
      setAvailableSlots(formattedSlots);

      if (formattedSlots.length > 0) {
        const earliestSlotDate = new Date(Math.min(...formattedSlots.map(s => new Date(s.date))));
        const today = new Date();
        const weeksDiff = Math.floor((earliestSlotDate - today) / (7 * 24 * 60 * 60 * 1000));
        setCurrentWeek(weeksDiff);
      }

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
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
    while (dates.length < 5) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
      }
      
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
    
    console.log('🔍 getAvailabilitySummary called:', {
      dateStr,
      interviewerId,
      totalAvailableSlots: availableSlots.length,
      availableSlotsSample: availableSlots.slice(0, 2)
    });
    
    // Filter slots for this date and interviewer
    const slots = availableSlots.filter(slot => {
      const dateMatch = slot.date === dateStr;
      const interviewerMatch = slot.interviewerId === interviewerId;
      
      console.log('Checking slot:', {
        slotDate: slot.date,
        slotInterviewerId: slot.interviewerId,
        dateMatch,
        interviewerMatch,
        looking_for: { dateStr, interviewerId }
      });
      
      return dateMatch && interviewerMatch;
    });
    
    console.log(`Found ${slots.length} slots for ${dateStr}, interviewer ${interviewerId}`);
    
    if (slots.length === 0) return null;
    
    // Slots are already split by backend, just filter out booked ones
    const availableSlotsList = slots.filter(slot => {
      return !bookedSlots.some(booked => 
        booked.date === dateStr && 
        booked.interviewerId === interviewerId &&
        booked.startTime === slot.startTime
      );
    });
    
    console.log(`After filtering booked: ${availableSlotsList.length} available`);
    
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
        rawBlocks: summary.rawBlocks
      });
      setShowSlotModal(true);
    }
  };

  const bookSlot = (slot) => {
    if (!selectedStudent || !selectedDaySlots) return;
    
    const newBooking = {
      id: Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentEmail: selectedStudent.email,
      interviewerId: selectedDaySlots.interviewer.id,
      interviewerName: selectedDaySlots.interviewer.name,
      date: selectedDaySlots.date,
      startTime: slot.start,
      endTime: slot.end,
      status: 'SCHEDULED'
    };
    
    setScheduledInterviews([...scheduledInterviews, newBooking]);
    setBookedSlots([...bookedSlots, {
      date: selectedDaySlots.date,
      interviewerId: selectedDaySlots.interviewer.id,
      startTime: slot.start,
      endTime: slot.end
    }]);
    
    setShowSlotModal(false);
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notScheduled = !scheduledInterviews.some(si => si.studentId === student.id);
    return matchesSearch && notScheduled;
  });

  const handleCancelInterview = (scheduleId) => {
    const schedule = scheduledInterviews.find(si => si.id === scheduleId);
    if (schedule) {
      setBookedSlots(bookedSlots.filter(b => 
        !(b.date === schedule.date && 
          b.interviewerId === schedule.interviewerId && 
          b.startTime === schedule.startTime)
      ));
      setScheduledInterviews(scheduledInterviews.filter(si => si.id !== scheduleId));
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
            {/* Mobile Student List */}
            <div className="lg:hidden mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User className="text-teal-500" size={20} />
                    Students ({filteredStudents.length})
                  </h2>
                  {selectedStudent && (
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
    <div className="mb-4 p-3 bg-teal-50 rounded-lg">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Slot Duration</label>
                  <div className="flex gap-2">
                    {[30, 60, 90].map(duration => (
                      <button
                        key={duration}
                        onClick={() => setSlotDuration(duration)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          slotDuration === duration ? 'bg-teal-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-teal-100'
                        }`}
                      >
                        {duration}m
                      </button>
                    ))}
                  </div>
                </div>
            

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`flex-shrink-0 w-48 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedStudent?.id === student.id
                          ? 'bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-400 shadow-lg'
                          : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{student.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{student.email}</p>
                        </div>
                        {selectedStudent?.id === student.id && (
                          <CheckCircle className="text-teal-500 flex-shrink-0 ml-2" size={16} />
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-teal-500 text-white inline-block">{student.role}</span>
                    </button>
                  ))}
                </div>

                {selectedStudent && (
                  <div className="mt-4 p-3 bg-teal-50 rounded-lg border-2 border-teal-200">
                    <p className="text-sm font-semibold text-teal-800 mb-1">Student Selected</p>
                    <p className="text-xs text-teal-600">Click on available slots in the calendar to schedule</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Desktop Student Panel */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <User className="text-teal-500" size={24} />
                      Students
                    </h2>
                    {selectedStudent && (
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="mb-4 p-3 bg-teal-50 rounded-lg">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Slot Duration</label>
                    <div className="flex gap-2">
                      {[30, 60, 90].map(duration => (
                        <button
                          key={duration}
                          onClick={() => setSlotDuration(duration)}
                          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                            slotDuration === duration ? 'bg-teal-500 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-teal-100'
                          }`}
                        >
                          {duration}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {filteredStudents.map(student => (
                      <button
                      
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`p-4 rounded-lg border-2 w-full cursor-pointer transition-all duration-200 ${
                          selectedStudent?.id === student.id
                            ? 'bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-400 shadow-lg scale-105'
                            : 'bg-white border-gray-200 hover:border-teal-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 truncate">{student.name}</h3>
                            <p className="text-sm text-gray-600 truncate">{student.email}</p>
                            <span className="text-xs px-2 py-1 rounded-full bg-teal-500 text-white inline-block mt-2">{student.role}</span>
                          </div>
                          {selectedStudent?.id === student.id && (
                            <CheckCircle className="text-teal-500  ml-2" size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedStudent && (
                    <div className="mt-4 p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                      <p className="text-sm font-semibold text-teal-800 mb-1">Student Selected</p>
                      <p className="text-xs text-teal-600">Click on available slots in the calendar to schedule</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="lg:col-span-9">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => setCurrentWeek(currentWeek - 1)}
                      className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
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
                               
  console.log('Calendar cell check:', {
    date: formatDate(date),
    interviewerId: interviewer.id,
    interviewerName: interviewer.name,
    summary: summary,
    hasSlots: summary && summary.total > 0
  });
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
                                      <p className="text-xs text-gray-500 mt-1">
                                        {summary.rawBlocks[0].startTime} - {summary.rawBlocks[summary.rawBlocks.length - 1].endTime}
                                      </p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
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
                  onClick={() => setShowSlotModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {selectedStudent && (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-teal-800 mb-2">Scheduling for:</p>
                  <p className="font-bold text-gray-800">{selectedStudent.name}</p>
                  <p className="text-sm text-gray-600">{selectedStudent.email}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDaySlots.slots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => bookSlot(slot)}
                    className="p-4 rounded-lg border-2 border-teal-300 bg-white hover:bg-teal-50 hover:border-teal-500 hover:shadow-lg transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
                          <Clock size={20} />
                          {slot.start} - {slot.end}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
            {/* Duration is already in the slot */}
            {selectedDaySlots.rawBlocks[0]?.duration || slotDuration} minutes
          </p>                      </div>
                      <Plus className="text-teal-500 group-hover:scale-110 transition-transform" size={24} />
                    </div>
                  </button>
                ))}
              </div>

              {selectedDaySlots.slots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>All slots for this day have been booked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRInterviewScheduler;