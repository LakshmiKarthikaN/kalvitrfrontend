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
  EyeOff
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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
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
    setErrors({});
    
    try {
      console.log("Starting to fetch all data...");
      
      // Test authentication first
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      console.log("Current user role:", userRole);
      
      // Check if user has required permissions
      const allowedRoles = ['ADMIN', 'HR', 'FACULTY'];
      if (!allowedRoles.includes(userRole)) {
        throw new Error(`Access denied. Your role (${userRole}) doesn't have permission to access this data.`);
      }
      
      // Fetch panelists
      await fetchPanelists();
      
      showNotification('Data loaded successfully!', 'success');

    } catch (error) {
      console.error('Critical error in fetchAllData:', error);
      
      // Handle specific error types
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        showNotification('Session expired. Please login again.', 'error');
        // Clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userRole'); 
        localStorage.removeItem('userEmail');
        window.location.href = '/login';
      } else if (error.message.includes('403') || error.message.includes('Access denied')) {
        showNotification('Access denied. You don\'t have permission to view this data.', 'error');
      } else {
        showNotification('Failed to fetch data: ' + error.message, 'error');
      }
      
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
            Interviews
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

      {/* Content based on active tab */}
      {activeTab === 'interviews' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Interviews content placeholder */}
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Interview scheduling coming soon...</p>
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

    

      <AddPanelistModal
        isOpen={showPanelistModal}
        onClose={() => setShowPanelistModal(false)}
        onSubmit={handleAddPanelist}
      />
    </div>
  );
};

export default InterviewManagement;