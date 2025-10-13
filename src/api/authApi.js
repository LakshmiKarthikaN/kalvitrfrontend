import axios from "axios";


let apiUrl = import.meta.env.VITE_API_URL;
console.log("API Base URL:", apiUrl);

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 120000, // Increased to 120 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});
console.log("API Base URL:", import.meta.env.VITE_API_URL);
console.log("api url", import.meta.env.VITE_API_URL);
// Add this enhanced response interceptor to your authApi.js
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Success:", {
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      status: response.status,
      dataLength: response.data?.length || 'N/A'
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error Details:", {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.response?.data?.message,
      userRole: localStorage.getItem('userRole'),
      hasToken: !!localStorage.getItem('token')
    });
    
    // Handle specific error cases
    if (error.response?.status === 403) {
      console.error("🚫 FORBIDDEN: Your current role doesn't have permission for this endpoint");
      console.error("Required roles for this endpoint: Check your Spring Security config");
    }
    
    if (error.response?.status === 401) {
      console.error("🔐 UNAUTHORIZED: Token may be expired or invalid");
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.baseURL + config.url);
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    console.log("Token exists:", !!token);
    console.log("User role:", userRole);
    const skipTokenUrls = [
      "/auth/login",
      "/auth/admin/login",
      "/auth/hr/login",
      "/auth/faculty/login",
      "/auth/student/login", 
      "/auth/panelists/login",// Added student login
      "/auth/register",
      "/auth/forgot-password",
      "/auth/validate-reset-token",
      "/auth/reset-password",
      "/students/verify-email",
      "/students/complete-registration",
    ];

    if (token && !skipTokenUrls.some((url) => config.url.includes(url))) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Added token to request");
    } else {
      console.log("❌ Token not added - either no token or skipped URL");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  });

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);
    console.error("Data:", error.response?.data);
    console.error("URL:", error.config?.url);
 
    const config = error.config || {};

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !config.url.includes("/auth/reset-password") &&
      !config.url.includes("/auth/validate-reset-token")
    ) {
     // console.log("Unauthorized - Clearing local storage and redirecting");
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// ✅ AUTHENTICATION APIs

/**
 * ✅ UNIFIED LOGIN - Handles both Users (Admin, HR, Faculty) and Students (ZSGS, PMIS)
 * This is the main login function that should be used for all login attempts
 */


// Enhanced token storage with validation
export const storeToken = (token) => {
  if (!isValidToken(token)) {
    console.error('❌ Invalid token format, not storing');
    return false;
  }
  
  localStorage.setItem("token", token);
  return true;
};

export const getToken = () => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      return null;
    }
    
    // Only validate when we're about to use the token
    if (!isValidToken(token)) {
      console.warn('⚠️ Invalid token found in storage');
      clearAuthData();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error retrieving token:', error);
    return null;
  }
};
export const loginApi = async (credentials) => {
  try {
    console.log("🔄 Attempting login...");
    const response = await api.post("/auth/login", credentials);
    
    if (response.data.success && response.data.token) {
      const token = response.data.token;
      
      // Just store it - don't validate immediately
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", response.data.role || '');
      localStorage.setItem("userEmail", response.data.email || '');
      localStorage.setItem("userId", response.data.userId || '');
      localStorage.setItem("userName", response.data.name || '');
      
      console.log("✅ Login successful - Role:", response.data.role);
      console.log("✅ Token stored, length:", token.length);
    } else {
      console.log("❌ Login failed:", response.data.message);
    }
    
    return response;
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data?.message || error.message);
    throw error;
  }
};

export const safeAtob = (str) => {
  try {
    if (!str || typeof str !== 'string' || str.trim() === '') {
      return null;
    }
    
    // Remove any whitespace
    str = str.trim();
    
    // Add padding if needed for base64url (JWT uses base64url encoding)
    while (str.length % 4 !== 0) {
      str += '=';
    }
    
    // Replace URL-safe characters with standard base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    
    return atob(str);
  } catch (error) {
    console.error('Failed to decode base64:', error);
    return null;
  }
};
export const isValidToken = (token) => {
  try {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn('❌ Token is empty or invalid type');
      return false;
    }
    
    token = token.trim();
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      console.warn('❌ Token does not have 3 parts:', parts.length);
      return false;
    }
    
    // Validate each part can be decoded
    for (let i = 0; i < 2; i++) { // Only check header and payload
      if (!parts[i] || parts[i].length === 0) {
        console.warn(`❌ Token part ${i} is empty`);
        return false;
      }
      
      const decoded = safeAtob(parts[i]);
      if (!decoded) {
        console.warn(`❌ Failed to decode token part ${i}`);
        return false;
      }
      
      // Try to parse as JSON
      try {
        JSON.parse(decoded);
      } catch (e) {
        console.warn(`❌ Token part ${i} is not valid JSON`);
        return false;
      }
    }
    
    console.log('✅ Token validation passed');
    return true;
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return false;
  }
};
export const clearAuthData = () => {
  try {
    console.log('🧹 Clearing auth data...');
    
    const keysToRemove = [
      'token',
      'userRole',
      'userEmail',
      'userId',
      'userName'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}`);
      }
    });
    
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    // Last resort
    try {
      localStorage.clear();
    } catch (e) {
      console.error('Failed to clear localStorage completely');
    }
  }
};

export const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    
    if (!item) {
      return null;
    }
    
    // Special handling for token
    if (key === 'token') {
      if (!isValidToken(item)) {
        console.warn('Invalid token found, clearing all data');
        clearAuthData();
        return null;
      }
    }
    
    return item;
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    clearAuthData();
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    
    // Don't validate token here - just check if it exists
    const result = !!(token && role);
    console.log('🔍 Auth check:', { hasToken: !!token, hasRole: !!role, result });
    
    return result;
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    if (!isAuthenticated()) {
      return null;
    }
    
    return {
      token: safeGetItem("token"),
      role: safeGetItem("userRole"),
      email: safeGetItem("userEmail"),
      userId: safeGetItem("userId"),
      name: safeGetItem("userName")
    };
  

  } catch (error) {
    console.error('Failed to get current user:', error);
    clearAuthData();
    return null;
  }
};
export const adminLoginApi = async (credentials) => {
  try {
    console.log("🔄 Admin login attempt...");
    const response = await api.post("/auth/admin/login", credentials);
    
    if (response.data.success && response.data.token) {
      const token = response.data.token;
      
      // Store without immediate validation
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", response.data.role || '');
      localStorage.setItem("userEmail", response.data.email || '');
      localStorage.setItem("userId", response.data.userId || '');
      localStorage.setItem("userName", response.data.name || '');
      
      console.log("✅ Admin login successful, role:", response.data.role);
    }
    
    return response;
  } catch (error) {
    console.error("❌ Admin login failed:", error);
    throw error;
  }
};

// Check if user is admin
export const isAdmin = () => {
  return isAuthenticated() && localStorage.getItem("userRole") === "admin";
};



// Safe logout function
export const logout = () => {
  clearAuthData();
  console.log("👋 User logged out");
  // Optionally redirect to login page
  window.location.href = '/login';
};


export const hrLoginApi = (credentials) => {
  console.log("HR-specific login attempt");
  return api.post("/auth/hr/login", credentials);
};

export const facultyLoginApi = (credentials) => {
  console.log("Faculty-specific login attempt");
  return api.post("/auth/faculty/login", credentials);
};

export const studentLoginApi = (credentials) => {
  console.log("Student-specific login attempt");
  return api.post("/auth/student/login", credentials);
};

export const registerApi = (data) => {
  console.log("Registration attempt");
  if (data instanceof FormData) {
    return api.post("/auth/register", data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  }
  return api.post("/auth/register", data);
};

export const forgotPasswordApi = (email) => api.post("/auth/forgot-password", { email });
export const resetPasswordApi = (token, newPassword) => api.post("/auth/reset-password", { token, newPassword });
export const validateResetTokenApi = (token) => api.get(`/auth/validate-reset-token?token=${token}`);
export const sendInvitationApi = (email, role) => api.post("/auth/send-invitation", { email, role });
export const resendInvitationApi = (email) => api.post("/auth/resend-invitation", { email });

// Add this to your authApi.js file, near the panelistApi section

export const interviewerApi = {
  // Get all interviewers (INTERVIEW_PANELIST and FACULTY only)
  getAllInterviewers: async () => {
    try {
      console.log("👥 Fetching all interviewers");
      
      const response = await api.get("/users");
      
      // Handle multiple possible response structures
      let allUsers = [];
      if (Array.isArray(response.data)) {
        allUsers = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        allUsers = response.data.users;
      }
      
      // Filter only INTERVIEW_PANELIST and FACULTY roles
      const interviewers = allUsers.filter(user => {
        const isActive = user.status === 'ACTIVE';
        const isInterviewer = user.role === 'INTERVIEW_PANELIST' || user.role === 'FACULTY';
        return isActive && isInterviewer;
      });
      
      console.log("✅ Interviewers fetched:", interviewers.length);
      console.log("   - Interview Panelists:", interviewers.filter(i => i.role === 'INTERVIEW_PANELIST').length);
      console.log("   - Faculty:", interviewers.filter(i => i.role === 'FACULTY').length);
      
      return {
        data: {
          data: interviewers,
          success: true
        }
      };
    } catch (error) {
      console.error("❌ Error fetching interviewers:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch interviewers");
    }
  }
};
export const panelistApi = {
  // Create a new panelist (using user creation endpoint)
  createPanelist: async (panelistData) => {
    try {
      console.log("👨‍💼 Creating panelist:", panelistData);
      // Transform panelist data to user data format
      const userData = {
        fullName: panelistData.fullName,
        email: panelistData.email,
        password: panelistData.password,
        role: 'INTERVIEW_PANELIST'
      };
      const response = await api.post("/users", userData);
      console.log("✅ Panelist created successfully");
      return response;
    } catch (error) {
      console.error("❌ Error creating panelist:", error);
      throw new Error(error.response?.data?.message || "Failed to create panelist");
    }
  },

  // Get all panelists (using dedicated panelist endpoint)
  getAllPanelists: async () => {
    try {
      console.log("👥 Fetching all panelists");
      try {
        const response = await api.get("/panelists");
        console.log("✅ Panelists fetched from dedicated endpoint:", response.data?.length || 0);
        return response;
      } catch (panelistError) {
        console.log("⚠️ Dedicated endpoint failed, trying users endpoint");
        const response = await api.get("/users?role=INTERVIEW_PANELIST");
        console.log("✅ Panelists fetched from users endpoint:", response.data?.length || 0);
        return response;
      }
    } catch (error) {
      console.error("❌ Error fetching panelists:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch panelists");
    }
  },

  // Update panelist (using user update endpoint)
  updatePanelist: async (panelistId, updateData) => {
    try {
      console.log("✏️ Updating panelist:", panelistId);
      return await api.put(`/users/${panelistId}`, updateData);
    } catch (error) {
      console.error("❌ Error updating panelist:", error);
      throw new Error(error.response?.data?.message || "Failed to update panelist");
    }
  },

  // Delete panelist (using user deletion endpoint)  
  deletePanelist: async (panelistId) => {
    try {
      console.log("🗑️ Deleting panelist:", panelistId);
      return await api.delete(`/users/${panelistId}`);
    } catch (error) {
      console.error("❌ Error deleting panelist:", error);
      throw new Error(error.response?.data?.message || "Failed to delete panelist");
    }
  },

  // Get panelist by ID (using user endpoint)
  getPanelistById: async (panelistId) => {
    try {
      console.log("🔍 Fetching panelist by ID:", panelistId);
      return await api.get(`/users/${panelistId}`);
    } catch (error) {
      console.error("❌ Error fetching panelist:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch panelist");
    }
  },

  // Update panelist status
  updatePanelistStatus: async (panelistId, status) => {
    try {
      console.log("🔄 Updating panelist status:", panelistId, status);
      return await api.put(`/users/${panelistId}/status?status=${status}`);
    } catch (error) {
      console.error("❌ Error updating panelist status:", error);
      throw new Error(error.response?.data?.message || "Failed to update panelist status");
    }
  }
};
// Add these methods to your existing authApi.js file

// Interview Panelist Availability API
export const availabilityApi = {
  
  // Submit interviewer availability
  submitAvailability: async (availabilityData) => {
    try {
      console.log("📅 Submitting availability:", availabilityData);
      const response = await api.post("/panelists/availability", availabilityData);
      console.log("✅ Availability submitted successfully");
      return response;
    } catch (error) {
      console.error("❌ Error submitting availability:", error);
      throw new Error(error.response?.data?.message || "Failed to submit availability");
    }
  },

  // Get interviewer's own availability
  getMyAvailability: async () => {
    try {
      console.log("📋 Fetching my availability");
      const response = await api.get("/panelists/availability");
      console.log("✅ Availability fetched:", response.data?.data?.length || 0, "slots");
      return response;
    } catch (error) {
      console.error("❌ Error fetching availability:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch availability");
    }
  },

  // Get assigned students for interviewer
  getAssignedStudents: async () => {
    try {
      console.log("👥 Fetching assigned students");
      const response = await api.get("/panelists/assigned-students");
      console.log("✅ Assigned students fetched:", response.data?.data?.length || 0);
      return response;
    } catch (error) {
      console.error("❌ Error fetching assigned students:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch assigned students");
    }
  },

  // Update availability slot
  updateAvailability: async (availabilityId, timeSlot) => {
    try {
      console.log("✏️ Updating availability:", availabilityId);
      const response = await api.put(`/panelists/availability/${availabilityId}`, timeSlot);
      console.log("✅ Availability updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Error updating availability:", error);
      throw new Error(error.response?.data?.message || "Failed to update availability");
    }
  },

  // Delete availability slot
  deleteAvailability: async (availabilityId) => {
    try {
      console.log("🗑️ Deleting availability:", availabilityId);
      const response = await api.delete(`/panelists/availability/${availabilityId}`);
      console.log("✅ Availability deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Error deleting availability:", error);
      throw new Error(error.response?.data?.message || "Failed to delete availability");
    }
  },

  // Get available slots for HR scheduling (HR/ADMIN only)
  getAvailableSlots: async (startDate = null, endDate = null, slotDuration = 60) => {
    try {
      console.log("🔍 Fetching available slots with duration:", slotDuration);
      let url = "/panelists/available-slots";
      const params = new URLSearchParams();
      
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (slotDuration) params.append("slotDuration", slotDuration);
      
      if (params.toString()) {
        url += "?" + params.toString();
      }
      
      const response = await api.get(url);
      console.log("✅ Available slots fetched:", response.data?.data?.length || 0);
      return response;
    } catch (error) {
      console.error("❌ Error fetching available slots:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch available slots");
    }
  }
};
// ✅ Password Reset APIs
export const checkPasswordResetRequiredApi = (userId) => 
  api.get(`/auth/check-password-reset-required?userId=${userId}`);

export const adminForceUserResetApi = (userId) => 
  api.post(`/auth/admin/force-user-reset/${userId}`);

// ✅ User Management APIs
export const createUserApi = (userData) => api.post("/users", userData);
export const getAllUsersApi = () => api.get("/users");
export const updateUserStatusApi = (userId, status) =>
  api.put(`/users/${userId}/status?status=${status}`);

// ✅ Student Management APIs
export const studentApi = {
  // Email verification for registration
  verifyEmail: (email) => 
    api.post("/students/verify-email", { email }),

  // Complete student registration
  completeRegistration: (registrationData) =>
    api.post("/students/complete-registration", registrationData),

  // Upload students from CSV (HR only)
  uploadStudentsCSV: (file, uploadedBy) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", uploadedBy);
    
    return api.post("/students/upload-csv", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Get all students (HR/Admin only)
  getAllStudents: () => api.get("/students"),

  // Get students by role (HR/Admin only)
  getStudentsByRole: (role) => api.get(`/students/role/${role}`),

  // Get incomplete registrations (HR/Admin only)
  getIncompleteRegistrations: () => api.get("/students/incomplete"),

  // Get student statistics (HR/Admin only)
  getStudentStatistics: () => api.get("/students/statistics"),

  // Get student profile (authenticated student only)
  getProfile: () => api.get("/students/profile"),

  // Update student profile (authenticated student only)  
  updateProfile: (profileData) => api.put("/students/profile", profileData),

  // Upload resume (authenticated student only)
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    
    return api.post("/students/resume", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Download resume (HR/Admin/Student only)
  downloadResume: (studentId) => api.get(`/students/${studentId}/resume`, {
    responseType: 'blob'
  }),

  // Update student status (HR/Admin only)
  updateStudentStatus: (studentId, status) =>
    api.put(`/students/${studentId}/status`, { status }),

  // Delete student (Admin only)
  deleteStudent: (studentId) => api.delete(`/students/${studentId}`),

  // Bulk update students (HR/Admin only)
  bulkUpdateStudents: (updates) => 
    api.put("/students/bulk-update", { updates }),

  // Export students data (HR/Admin only)
  exportStudents: (format = 'csv', filters = {}) =>
    api.post("/students/export", { format, filters }, {
      responseType: 'blob'
    }),

  // Search students (HR/Admin only)
  searchStudents: (query, filters = {}) =>
    api.post("/students/search", { query, ...filters }),

  // Get student by ID (HR/Admin only)
  getStudentById: (studentId) => api.get(`/students/${studentId}`),

  // Reset student password (HR/Admin only)
  resetStudentPassword: (studentId) =>
    api.post(`/students/${studentId}/reset-password`),
};






// ✅ File Management APIs
export const fileApi = {
  // Upload file
  uploadFile: (file, category = 'general') => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    
    return api.post("/files/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  // Download file
  downloadFile: (fileId) => 
    api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    }),

  // Delete file
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),

  // Get file info
  getFileInfo: (fileId) => api.get(`/files/${fileId}`),
};

// Verify if email exists in the system
export const verifyEmailApi = async (email) => {
  return await api.post("/students/verify-email", { email });
};

// Complete student registration after email verification
export const completeRegistrationApi = async (formData) => {
  return await api.post("/students/complete-registration", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};



export default api;