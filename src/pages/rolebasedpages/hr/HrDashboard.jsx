import React, { useState, useEffect, useRef } from 'react';
import { Button, InputField } from "../../../components/common";
import Sidebar from "../../../components/rolebasedcomponents/Sidebar";
import Header from "../../../components/rolebasedcomponents/Header";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  Power,
  Shield,
  Plus,
  Search,
  Download,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  CheckCircle,
  Clock,
  Upload,
  Save,
  X,
  Bell,
  User,
  Loader,
  Check,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Box, useMediaQuery, useTheme } from '@mui/material';
import InterviewManagement from './interviewmanagement/InterviewManagement';
import LogoImg from "../../../assets/LogoImg.png";

const API_BASE = import.meta.env.VITE_API_URL;

// API functions for student management
const studentAPI = {
  uploadStudentCSV: async (file, uploadedBy) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', uploadedBy);

    const response = await fetch(`${API_BASE}/students/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return await response.json();
  },

  getStudentStatistics: async () => {
    const response = await fetch(`${API_BASE}/students/statistics`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch statistics');
    }

    return await response.json();
  },

  getAllStudents: async () => {
    const response = await fetch(`${API_BASE}/students`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }

    return await response.json();
  },

  getIncompleteRegistrations: async () => {
    const response = await fetch(`${API_BASE}/students/incomplete`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch incomplete registrations');
    }

    return await response.json();
  }
};
console.log("Fetching from:", `${import.meta.env.VITE_API_URL}/hr/dashboard`);
console.log("Fetching from:", API_BASE);


const StatsCard = ({ title, value, icon: Icon, color = 'blue', subtitle = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
    teal: 'bg-teal-100 text-teal-600',
    orange: 'bg-orange-100 text-orange-600'
  };
    
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};

const CSVUpload = ({ onFileUpload, uploadStatus, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const fileInputRef = useRef(null);

  const sampleData = [
    ["Email", "role"],
    ["arjun.kumar@example.com", "ZSGS"],
    ["priya.sharma@example.com", "PMIS"],
    ["student1@college.edu", "ZSGS"],
    ["student2@college.edu", "PMIS"],
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
        onFileUpload(file);
      } else {
        setStatusMessage("Please select a CSV file");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.toLowerCase().endsWith('.csv')) {
        onFileUpload(file);
      } else {
        setStatusMessage("Please select a CSV file");
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (uploadStatus === "success") {
      resetFileInput();
      setStatusMessage("Students uploaded successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
      onUploadSuccess?.();
    } else if (uploadStatus === "error") {
      resetFileInput();
      setStatusMessage("Upload failed. Please try again.");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  }, [uploadStatus]);

  const downloadSampleCSV = () => {
    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getUploadBoxStyles = () => {
    if (uploadStatus === "loading") {
      return "border-blue-400 bg-blue-50";
    } else if (dragActive) {
      return "border-teal-400 bg-teal-50";
    } else if (uploadStatus === "success") {
      return "border-green-400 bg-green-50";
    } else if (uploadStatus === "error") {
      return "border-red-400 bg-red-50";
    }
    return "border-gray-300 hover:border-teal-400 hover:bg-teal-50";
  };

  const getStatusIcon = () => {
    if (uploadStatus === "loading") {
      return <Loader className="h-8 w-8 text-blue-500 mb-3 mx-auto animate-spin" />;
    } else if (uploadStatus === "success") {
      return <Check className="h-8 w-8 text-green-500 mb-3 mx-auto" />;
    } else if (uploadStatus === "error") {
      return <X className="h-8 w-8 text-red-500 mb-3 mx-auto" />;
    }
    return <Upload className="h-8 w-8 text-gray-400 mb-3 mx-auto" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Bulk Student Upload</h3>
        <Button
          onClick={downloadSampleCSV}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" />
          Sample CSV
        </Button>
      </div>

      <div
  className={`w-full max-w-2xl mx-auto border-2 border-dashed rounded-xl 
              p-4 sm:p-6 md:p-8 text-center transition-colors 
              ${getUploadBoxStyles()}`}
  onDragEnter={handleDrag}
  onDragLeave={handleDrag}
  onDragOver={handleDrag}
  onDrop={handleDrop}
>
  {/* Status Icon */}
  <div className="flex justify-center mb-3 sm:mb-4">{getStatusIcon()}</div>

  {/* Upload Instruction */}
  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
    {uploadStatus === "loading" 
      ? "Uploading..." 
      : "Drop CSV file here or choose file"}
  </p>

  {/* Status Message */}
  {statusMessage && (
    <p
      className={`text-xs sm:text-sm mb-3 ${
        uploadStatus === "success"
          ? "text-green-600"
          : uploadStatus === "error"
          ? "text-red-600"
          : "text-gray-600"
      }`}
    >
      {statusMessage}
    </p>
  )}

  {/* Hidden File Input */}
  <input
    type="file"
    accept=".csv,text/csv"
    ref={fileInputRef}
    onChange={handleFileInput}
    className="hidden"
    id="csvFileInput"
    disabled={uploadStatus === "loading"}
  />

  {/* File Upload Button */}
  <label
    htmlFor="csvFileInput"
    className={`inline-block w-full sm:w-auto px-4 py-2 text-sm sm:text-base 
                rounded-lg cursor-pointer transition-colors 
                ${
                  uploadStatus === "loading"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
  >
    {uploadStatus === "loading" ? "Uploading..." : "Choose File"}
  </label>
</div>


      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 font-medium mb-1">CSV Format:</p>
        <p className="text-xs text-gray-500">Email, role (ZSGS or PMIS)</p>
      </div>
    </div>
  );
};

const StudentList = ({ students, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = students.filter(student => 
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.fullName && student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    student.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Student Records</h3>
          <Button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students by email, name, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{student.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">
                    {student.fullName || 'Not registered'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.role === 'ZSGS' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {student.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {student.fullName && student.hashedPassword ? (
                    <span className="flex items-center text-sm text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </span>
                  ) : (
                    <span className="flex items-center text-sm text-orange-600">
                      <Clock className="h-4 w-4 mr-1" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button className="text-teal-600 hover:text-teal-900 mr-3">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No students found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const StudentManagement = () => {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);

  const getCurrentUser = () => {
    return {
      name: localStorage.getItem("userName") || "HR Admin",
      email: localStorage.getItem("userEmail") || "hr@example.com"
    };
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchStudents = async () => {
    try {
      const studentsData = await studentAPI.getAllStudents();
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      showNotification('Failed to fetch students', 'error');
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await studentAPI.getStudentStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showNotification('Failed to fetch statistics', 'error');
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchStudents(), fetchStatistics()]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleFileUpload = async (file) => {
    setUploadStatus("loading");
    
    try {
      const currentUser = getCurrentUser();
      const response = await studentAPI.uploadStudentCSV(file, currentUser.name);
      
      setUploadStatus("success");
      showNotification(
        `Successfully uploaded ${response.successfulRecords} students${
          response.failedRecords > 0 ? ` (${response.failedRecords} failed)` : ''
        }`, 
        'success'
      );
      
      // Refresh data after successful upload
      await Promise.all([fetchStudents(), fetchStatistics()]);
      
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus("error");
      showNotification(error.message || "Upload failed. Please try again.", "error");
    }
  };

  const handleUploadSuccess = () => {
    // Additional actions after successful upload
    console.log('Upload completed successfully');
  };

  const handleRefresh = async () => {
    await Promise.all([fetchStudents(), fetchStatistics()]);
    showNotification('Data refreshed successfully', 'success');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-teal-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {notification.type === 'error' && <XCircle className="h-5 w-5" />}
          {notification.type === 'info' && <AlertCircle className="h-5 w-5" />}
          {notification.message}
          <button 
            onClick={() => setNotification(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={statistics.total || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="ZSGS Students"
          value={statistics.zsgs || 0}
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="PMIS Students"
          value={statistics.pmis || 0}
          icon={Shield}
          color="purple"
        />
        <StatsCard
          title="Pending Registration"
          value={statistics.incomplete || 0}
          icon={Clock}
          color="orange"
        />
      </div> */}

      {/* CSV Upload */}
      <CSVUpload 
        onFileUpload={handleFileUpload}
        uploadStatus={uploadStatus}
        onUploadSuccess={handleUploadSuccess}
      />
      
      {/* Student List */}
      <StudentList 
        students={students}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const stats = await studentAPI.getStudentStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 text-teal-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your student management overview.</p>
      </div>

      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Students"
          value={statistics.total || 0}
          icon={Users}
          color="blue"
          subtitle="All registered students"
        />
        <StatsCard
          title="ZSGS Program"
          value={statistics.zsgs || 0}
          icon={GraduationCap}
          color="green"
          subtitle="Zero to Software Graduate Students"
        />
        <StatsCard
          title="PMIS Program"
          value={statistics.pmis || 0}
          icon={Shield}
          color="purple"
          subtitle="Product Management Intern Students"
        />
        <StatsCard
          title="Active Students"
          value={statistics.active || 0}
          icon={CheckCircle}
          color="teal"
          subtitle="Currently active accounts"
        />
        <StatsCard
          title="Complete Registrations"
          value={statistics.complete || 0}
          icon={FileText}
          color="blue"
          subtitle="Fully registered students"
        />
        <StatsCard
          title="Pending Registration"
          value={statistics.incomplete || 0}
          icon={Clock}
          color="orange"
          subtitle="Awaiting completion"
        />
      </div> */}

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Upload Student CSV</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-medium">View All Students</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-purple-700 font-medium">Generate Reports</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Complete</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400"
                    style={{ 
                      width: `${statistics.total > 0 ? (statistics.complete / statistics.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-green-600">{statistics.complete || 0}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-400"
                    style={{ 
                      width: `${statistics.total > 0 ? (statistics.incomplete / statistics.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-orange-600">{statistics.incomplete || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

// Main HR Dashboard Component
const HRDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentUser] = useState({
    name: localStorage.getItem('userName') || 'HR Admin',
    role: 'hr',
    avatar: 'H'
  });
  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };
 const handleMobileClose = () => {
    setMobileOpen(false);
  };
  const drawerWidth = 240;
  const collapsedDrawerWidth = 60;
  const renderContent = () => {
    switch (selectedMenu) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Student Management':
        return <StudentManagement />;
        case 'Interview Management':
          return <InterviewManagement/>;
      case 'Reports':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
            <p className="text-gray-600">Generate and download various reports.</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Feature coming soon...</p>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Configure system settings and preferences.</p>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Feature coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        role="admin"
        onMenuSelect={setSelectedMenu}
        selectedMenu={selectedMenu}
        isCollapsed={isSidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`
          },
          transition: 'width 0.3s ease, margin 0.3s ease',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Header 
          role={"admin"} 
          user={"Admin"} 
          onMenuToggle={handleMenuToggle}
        />

        <Box sx={{ p: { xs: 0, md: 3 } }}>
          {loading && (
            <Box
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1300,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 2,
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    border: '2px solid #0f766e',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
                <span>Processing...</span>
              </Box>
            </Box>
          )}
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
  
};

export default HRDashboard;