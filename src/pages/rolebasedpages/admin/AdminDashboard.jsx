import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/rolebasedcomponents/Sidebar";
import Header from "../../../components/rolebasedcomponents/Header";
import StatsCard from "../../../components/rolebasedcomponents/StatsCard";
import UserTable from "../../../components/rolebasedcomponents/UserTable";
import { Button, InputField } from "../../../components/common";
import { Formik, Form } from "formik";
import { AddUserSchema } from "../../../utils/validatorslogic/Validators.js";
import { getAllUsersApi, createUserApi }
from "../../../api/authApi.js"; 
import { Box } from '@mui/material';
// adjust path
import {
  Users,
  UserCheck,
  Shield,
  UserX,
  Power,
  PowerOff,
  UserPlus,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react";

// ✅ Fixed API URL - remove /KalviTrack since it's not in your backend
const API_BASE_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [portalStatus, setPortalStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const handleMenuToggle = () => {
    setIsSidebarCollapsed(prev => !prev);
  };
  const drawerWidth = 240;
  const collapsedDrawerWidth = 60;

  // Add User Form State
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "HR"
  });

  const togglePortal = () => setPortalStatus((prev) => !prev);
// Paste the token value (without "Bearer ")
const tokenValue = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiO..."; // Your actual token
const parts = tokenValue.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Decoded Token:', payload);

  // ✅ Add auth headers helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };
// Fetch users function - Admin can see all users
const fetchUsers = async () => {
  setLoading(true);
  setError("");
  
  try {
    console.log("Fetching users for Admin...");
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    
    console.log("=== TOKEN DEBUG ===");
    console.log("Token exists:", !!token);
    console.log("Token preview:", token?.substring(0, 30) + "...");
    console.log("User role:", userRole);
    console.log("==================");
    
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    console.log("Fetching users for Admin...");

    // ✅ Use the getAllUsersApi from authApi.js
    const response = await getAllUsersApi();
    
    console.log("Response:", response);
    
    // Handle different response structures
    let usersData = [];
    if (response.data?.success && Array.isArray(response.data.users)) {
      usersData = response.data.users;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      usersData = response.data.data;
    } else if (Array.isArray(response.data)) {
      usersData = response.data;
    }
    
    // Filter only HR and FACULTY for Admin
    const filteredUsers = usersData.filter(user => 
      user.role === 'HR' || user.role === 'FACULTY'
    );
    
    setUsers(filteredUsers);
    console.log(`✅ Fetched ${filteredUsers.length} users (HR/FACULTY only)`);
    
  } catch (err) {
    console.error("Error fetching users:", err);
    
    if (err.response?.status === 401) {
      setError("Authentication failed. Please login again.");
      localStorage.clear();
      window.location.href = "/login";
    } else if (err.response?.status === 403) {
      setError("Access forbidden - Admin role required");
    } else {
      setError(err.response?.data?.message || "Failed to fetch users");
    }
  } finally {
    setLoading(false);
  }
};
 

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userForm.fullName || !userForm.email || !userForm.password || !userForm.role) {
      setError("All fields are required");
      return;
    }

    if (!userForm.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    if (userForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: userForm.fullName,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          status: "ACTIVE"
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(`User ${userForm.fullName} created successfully!`);
        setUserForm({ fullName:"",email: "", password: "", role: "HR" });
        setShowAddUserForm(false);
        await fetchUsers(); // Refresh user list
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Add user error:", err);
      setError("Network error during user creation");
    } finally {
      setLoading(false);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // Dashboard rendering
  const renderDashboard = () => (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Manage internship portal and user access
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={clearMessages}
            className="text-red-500 hover:text-red-700 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{successMessage}</p>
          <button 
            onClick={clearMessages}
            className="text-green-500 hover:text-green-700 text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

     
    </div>
  );

  // Add User Form Component
  const AddUserForm = () => {
    const [formData, setFormData] = useState({
      fullName:'',
      email: '',
      password: '',
      role: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage('');
    
      // Validation
      if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
        setMessage('All fields are required');
        return;
      }
    
      if (formData.password.length < 6) {
        setMessage('Password must be at least 6 characters long');
        return;
      }
    
      try {
        setIsSubmitting(true);
        console.log('Submitting data:', formData);
    
        // ✅ Use createUserApi from authApi.js
        const response = await createUserApi(formData);
        
        console.log('Response:', response.data);
    
        if (response.data.success) {
          setMessage('User created successfully!');
          setFormData({ fullName: '', email: '', password: '', role: '' });
          
          // Refresh the user list
          await fetchUsers();
          
          // Auto-close form after 2 seconds
          setTimeout(() => {
            setShowAddUserForm(false);
          }, 2000);
        } else {
          setMessage(response.data.message || 'Failed to create user');
        }
      } catch (error) {
        console.error('Error:', error);
        setMessage(error.response?.data?.message || 'Network error occurred');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New User</h2>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('success') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
  
        <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Due"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
                      <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select Role</option>
              <option value="HR">HR</option>
              <option value="FACULTY">Faculty</option>
            </select>
          </div>
         <div className=" flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create User"}
          </Button>
          </div>
        </div>
      </div>
    );
  };
  // Dynamic rendering
  const renderContent = () => {
    switch (selectedMenu) {
      case "Dashboard":
        return renderDashboard();
      case "Users":
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                <p className="text-gray-600">Create and manage system users</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  Total Users: {users.length}
                </div>
                <Button
                  onClick={() => setShowAddUserForm(true)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
                <button 
                  onClick={clearMessages}
                  className="text-red-500 hover:text-red-700 text-xs underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{successMessage}</p>
                <button 
                  onClick={clearMessages}
                  className="text-green-500 hover:text-green-700 text-xs underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="space-y-6">
              {showAddUserForm && <AddUserForm />}
              
              {users.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      All Users
                    </h3>
                    <div className="text-sm text-gray-500">
                      Showing {users.length} users
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className ="px-4 py-3 text-left font-medium text-gray-900">Name</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">Email</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">Role</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-900">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                           <td className="px-4 py-3 text-gray-900">{user.fullName}</td>
                            <td className="px-4 py-3 text-gray-900">{user.email}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'HR' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {users.length === 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first user</p>
                  <button
                    onClick={() => setShowAddUserForm(true)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Add First User
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case "Settings":
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Select a menu item to get started.</p>
            </div>
          </div>
        );
    }
  };

  // return (
  //   <div className="flex min-h-screen bg-gray-50">
  //     <Sidebar
  //       role="admin"
  //       onMenuSelect={setSelectedMenu}
  //       selectedMenu={selectedMenu}
  //     />
  //     <div className="flex-1 flex flex-col">
  //       <Header role="admin" user={{ name: "Admin User" }} />
  //       <main className="flex-1 overflow-y-auto">
  //         {loading && (
  //           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  //             <div className="bg-white rounded-lg p-6 flex items-center gap-3">
  //               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
  //               <span>Processing...</span>
  //             </div>
  //           </div>
  //         )}
  //         {renderContent()}
  //       </main>
  //     </div>
  //   </div>
  // );
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar
        role="admin"
        onMenuSelect={setSelectedMenu}
        selectedMenu={selectedMenu}
        isCollapsed={isSidebarCollapsed}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${isSidebarCollapsed ? collapsedDrawerWidth : drawerWidth}px)`,
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

        <Box sx={{ p: 3 }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;