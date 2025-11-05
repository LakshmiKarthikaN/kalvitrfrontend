import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock as PendingIcon,
  Download,
  RefreshCw,
  UserPlus,
  Calendar as ScheduleIcon,
  X,
  EyeOff,
  Video,           // ← ADD THIS
  Building2,       // ← ADD THIS (if you want to use it later)
  FileText 
} from 'lucide-react';
import { panelistApi } from '../../../../api/authApi';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import AddPanelistModal from './AddPanelistModal';

const API_BASE = import.meta.env.VITE_API_URL;

// Enhanced API helper with better error handling
const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE}${url}`, config);
    
    // Handle unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

const InterviewManagement = () => {
  const [currentView, setCurrentView] = useState('management'); // 'management' or 'schedule'

  const [activeTab, setActiveTab] = useState('interviews');
  const [panelists, setPanelists] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPanelistModal, setShowPanelistModal] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };
  const fetchInterviews = async () => {
    try {
      console.log("📅 Fetching scheduled interviews...");
      const response = await apiCall('/interviews/scheduled');
      
      if (response.success && response.data) {
        setInterviews(response.data);
        console.log("✅ Interviews fetched:", response.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      showNotification('Failed to fetch interviews: ' + error.message, 'error');
    }
  };

  // Fetch panelists (FACULTY and INTERVIEW_PANELIST users)
  const fetchPanelists = async () => {
    try {
      console.log("Fetching panelists...");
      const userRole = localStorage.getItem('userRole');
      
      let endpoint = '/hr/users'; // Default to HR endpoint
      
      // Determine which endpoint to use based on user role
      if (userRole === 'ADMIN') {
        // Admin should see both HR and Faculty, but for panelists we want Faculty + Interview Panelist
        // We'll use HR endpoint since it shows FACULTY and INTERVIEW_PANELIST
        endpoint = '/hr/users';
      } else if (userRole === 'HR') {
        endpoint = '/hr/users'; // HR sees FACULTY and INTERVIEW_PANELIST
      }
      
      const response = await apiCall(endpoint);
      
      if (response.success && response.users) {
        // Filter to only show FACULTY and INTERVIEW_PANELIST users
        const filteredPanelists = response.users.filter(user => 
          user.role === 'FACULTY' || user.role === 'INTERVIEW_PANELIST'
        );
        setPanelists(filteredPanelists);
        console.log("Panelists fetched successfully:", filteredPanelists);
      } else {
        throw new Error(response.message || 'Failed to fetch panelists');
      }
    } catch (error) {
      console.error('Error fetching panelists:', error);
      setErrors(prev => ({ ...prev, panelists: error.message }));
      showNotification('Failed to fetch panelists: ' + error.message, 'error');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchInterviews(),
        fetchPanelists()
      ]);
      showNotification('Data loaded successfully!', 'success');
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Failed to fetch data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  const handleCancelInterview = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel this interview?')) {
      return;
    }

    try {
      const response = await apiCall(`/interviews/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.success) {
        showNotification('Interview cancelled successfully!', 'success');
        await fetchInterviews();
      }
    } catch (error) {
      console.error('Error cancelling interview:', error);
      showNotification('Failed to cancel interview: ' + error.message, 'error');
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString.substring(0, 5); // HH:MM format
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleAddPanelist = async (panelistData) => {
    try {
      // Use the panelistApi directly instead of interviewApi
      await panelistApi.createPanelist(panelistData);
      showNotification('Panelist added successfully!', 'success');
      await fetchAllData();
    } catch (error) {
      console.error('Error adding panelist:', error);
      showNotification(error.message || 'Failed to add panelist', 'error');
    }
  };
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || interview.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  // Filter panelists based on search term and status
  const filteredPanelists = panelists.filter(panelist => {
    const matchesSearch = panelist.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || panelist.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Clock className="h-12 w-12 text-teal-600 mx-auto mb-3 animate-spin" />
          <p className="text-gray-600">Loading interview data...</p>
        </div>
      </div>
    );
  }
  if (currentView === 'schedule') {
    return (
      <ScheduleInterviewModal
        onBack={() => setCurrentView('management')}
        students={students}
        panelists={panelists}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'error' ? 'bg-red-500' : 'bg-teal-500'
        } text-white`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
            {notification.type === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Management</h1>
        <p className="text-gray-600">Schedule interviews and manage interview panelists</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
      <button
            onClick={() => setCurrentView('schedule')}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ScheduleIcon className="h-6 w-6" />
            <span className="font-semibold">Schedule Interview</span>
          </button>

        <button
          onClick={() => setShowPanelistModal(true)}
          className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
          <UserPlus className="h-5 w-5" />
          Add Panelist
        </button>
        
        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'interviews'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Interviews ({filteredInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('panelists')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'panelists'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Panelists ({filteredPanelists.length})
          </button>
        </nav>
      </div>

      {activeTab === 'interviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scheduled Interviews
              </h3>
              <span className="text-sm text-gray-500">
                Total: {filteredInterviews.length}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student or interviewer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interviewer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInterviews.map((interview) => (
                  <tr key={interview.sessionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {interview.studentName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {interview.studentEmail}
                        </div>
                        {interview.studentMobile && (
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {interview.studentMobile}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {interview.interviewerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {interview.interviewerEmail}
                        </div>
                        <span className={`inline-flex px-2 py-1 mt-1 text-xs font-semibold rounded-full w-fit ${
                          interview.interviewerRole === 'FACULTY' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {interview.interviewerRole === 'FACULTY' ? 'Faculty' : 'Interview Panelist'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(interview.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatTime(interview.startTime)} - {formatTime(interview.endTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {interview.status}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4">
                      {interview.meetingLink ? (
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join Meeting
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedInterview(interview);
                            setShowDetailsModal(true);
                          }}
                          className="text-teal-600 hover:text-teal-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {interview.status === 'SCHEDULED' && (
                          <>
                            <button 
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleCancelInterview(interview.sessionId)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Cancel"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredInterviews.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">No interviews found</p>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'ALL' ? 
                    'Try adjusting your search or filter criteria.' : 
                    'No interviews have been scheduled yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Panelists Tab */}
      {activeTab === 'panelists' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Interview Panelists (Faculty & Interview Panelists)
              </h3>
              <span className="text-sm text-gray-500">
                Total: {filteredPanelists.length}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPanelists.map((panelist) => (
                  <tr key={panelist.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{panelist.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">
                          {panelist.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        panelist.role === 'FACULTY' ? 'bg-teal-100 text-blue-800' :
                        panelist.role === 'INTERVIEW_PANELIST' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {panelist.role === 'FACULTY' ? 'Faculty' : 
                         panelist.role === 'INTERVIEW_PANELIST' ? 'Interview Panelist' : 
                         panelist.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          panelist.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'
                        }`}></div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          panelist.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {panelist.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {panelist.createdAt ? 
                          new Date(panelist.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-teal-600 hover:text-teal-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPanelists.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-2">No panelists found</p>
                <p className="text-gray-400 mb-4">
                  {searchTerm || statusFilter !== 'ALL' ? 
                    'Try adjusting your search or filter criteria.' : 
                    'No faculty members or interview panelists are available.'
                  }
                </p>
                {(!searchTerm && statusFilter === 'ALL') && (
                  <button
                    onClick={() => setShowPanelistModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Add First Panelist
                  </button>
                )}
              </div>
            )}
            
            {errors.panelists && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600">Error loading panelists: {errors.panelists}</p>
                <button
                  onClick={fetchPanelists}
                  className="mt-3 text-teal-600 hover:text-teal-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
 {showDetailsModal && selectedInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">Interview Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
    
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Student Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedInterview.studentName}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedInterview.studentEmail}</p>
                  {selectedInterview.studentMobile && (
                    <p className="text-sm"><span className="font-medium">Mobile:</span> {selectedInterview.studentMobile}</p>
                  )}
                  {selectedInterview.studentCollege && (
                    <p className="text-sm"><span className="font-medium">College:</span> {selectedInterview.studentCollege}</p>
                  )}
                </div>
              </div>
                 {/* Interviewer Info */}
                 <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interviewer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedInterview.interviewerName}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedInterview.interviewerEmail}</p>
                  <p className="text-sm"><span className="font-medium">Role:</span> {selectedInterview.interviewerRole}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Schedule</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Date:</span> {formatDate(selectedInterview.date)}</p>
                  <p className="text-sm"><span className="font-medium">Time:</span> {formatTime(selectedInterview.startTime)} - {formatTime(selectedInterview.endTime)}</p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInterview.status)}`}>
                      {selectedInterview.status}
                    </span>
                  </p>
                  {selectedInterview.meetingLink && (
                    <p className="text-sm">
                      <span className="font-medium">Meeting Link:</span>
                      <a href={selectedInterview.meetingLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                        Join Meeting
                      </a>
                    </p>
                  )}
                  {selectedInterview.remarks && (
                    <p className="text-sm"><span className="font-medium">Remarks:</span> {selectedInterview.remarks}</p>
                  )}
                  {selectedInterview.interviewResult && (
                    <p className="text-sm"><span className="font-medium">Result:</span> {selectedInterview.interviewResult}</p>
                  )}
                </div>
              </div>
              {selectedInterview.createdAt && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Scheduled on:</span> {new Date(selectedInterview.createdAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              {selectedInterview.status === 'SCHEDULED' && (
                <button
                  onClick={() => {
                    handleCancelInterview(selectedInterview.sessionId);
                    setShowDetailsModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Interview
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
  
      <AddPanelistModal
        isOpen={showPanelistModal}
        onClose={() => setShowPanelistModal(false)}
        onSubmit={handleAddPanelist}
      />
    </div>
  );
};

export default InterviewManagement;