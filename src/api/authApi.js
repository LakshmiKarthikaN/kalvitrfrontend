import axios from "axios";

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isDevelopment) {
    return 'http://localhost:8080/api';
  }
  
  return 'https://www.kalvi-track.co.in/api';
};

const apiUrl = getApiUrl();

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
    const token = localStorage.getItem("token");

    const skipTokenUrls = [
      "/auth/login",
      "/auth/admin/login",
      "/auth/hr/login",
      "/auth/faculty/login",
      "/auth/student/login", 
      "/auth/panelists/login",
      "/auth/register",
      "/auth/forgot-password",
      "/auth/validate-reset-token",
      "/auth/reset-password",
      "/students/verify-email",
      "/students/complete-registration",
    ];

    if (token && !skipTokenUrls.some((url) => config.url.includes(url))) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error.config || {};
    const url = config.url || '';

    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) &&
      !url.includes("/auth/reset-password") &&
      !url.includes("/auth/validate-reset-token") &&
      !url.includes("/students/verify-email") &&
      !url.includes("/students/complete-registration")
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Token storage with validation
export const storeToken = (token) => {
  if (!isValidToken(token)) {
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
    
    if (!isValidToken(token)) {
      clearAuthData();
      return null;
    }
    
    return token;
  } catch (error) {
    return null;
  }
};

export const loginApi = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    
    if (response.data.success && response.data.token) {
      const token = response.data.token;
      
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", response.data.role || '');
      localStorage.setItem("userEmail", response.data.email || '');
      localStorage.setItem("userId", response.data.userId || '');
      localStorage.setItem("userName", response.data.name || '');
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const safeAtob = (str) => {
  try {
    if (!str || typeof str !== 'string') {
      return null;
    }

    str = str.trim();

    if (!/^[A-Za-z0-9\-_]+$/.test(str)) {
      return null;
    }

    while (str.length % 4 !== 0) {
      str += '=';
    }

    str = str.replace(/-/g, '+').replace(/_/g, '/');

    return atob(str);
  } catch (error) {
    return null;
  }
};

export const isValidToken = (token) => {
  try {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      return false;
    }

    token = token.trim();
    const parts = token.split('.');

    if (parts.length !== 3) {
      return false;
    }

    for (let i = 0; i < 2; i++) {
      const decoded = safeAtob(parts[i]);
      if (!decoded) {
        return false;
      }

      try {
        JSON.parse(decoded);
      } catch (e) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const clearAuthData = () => {
  try {
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
        // Silent fail
      }
    });
  } catch (error) {
    try {
      localStorage.clear();
    } catch (e) {
      // Silent fail
    }
  }
};

export const safeGetItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    
    if (!item) {
      return null;
    }
    
    if (key === 'token') {
      if (!isValidToken(item)) {
        clearAuthData();
        return null;
      }
    }
    
    return item;
  } catch (error) {
    clearAuthData();
    return null;
  }
};

export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    
    return !!(token && role);
  } catch (error) {
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
    clearAuthData();
    return null;
  }
};

export const adminLoginApi = async (credentials) => {
  try {
    const response = await api.post("/auth/admin/login", credentials);
    
    if (response.data.success && response.data.token) {
      const token = response.data.token;
      
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", response.data.role || '');
      localStorage.setItem("userEmail", response.data.email || '');
      localStorage.setItem("userId", response.data.userId || '');
      localStorage.setItem("userName", response.data.name || '');
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const isAdmin = () => {
  return isAuthenticated() && localStorage.getItem("userRole") === "admin";
};

export const logout = () => {
  clearAuthData();
  window.location.href = '/login';
};

export const hrLoginApi = (credentials) => {
  return api.post("/auth/hr/login", credentials);
};

export const facultyLoginApi = (credentials) => {
  return api.post("/auth/faculty/login", credentials);
};

export const studentLoginApi = (credentials) => {
  return api.post("/auth/student/login", credentials);
};

export const registerApi = (data) => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  sessionStorage.clear();
  
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

export const interviewerApi = {
  getAllInterviewers: async () => {
    try {
      const response = await api.get("/users");
      
      let allUsers = [];
      if (Array.isArray(response.data)) {
        allUsers = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      } else if (response.data?.users && Array.isArray(response.data.users)) {
        allUsers = response.data.users;
      }
      
      const interviewers = allUsers.filter(user => {
        const isActive = user.status === 'ACTIVE';
        const isInterviewer = user.role === 'INTERVIEW_PANELIST' || user.role === 'FACULTY';
        return isActive && isInterviewer;
      });
      
      return {
        data: {
          data: interviewers,
          success: true
        }
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch interviewers");
    }
  }
};

export const panelistApi = {
  createPanelist: async (panelistData) => {
    try {
      const userData = {
        fullName: panelistData.fullName,
        email: panelistData.email,
        password: panelistData.password,
        role: 'INTERVIEW_PANELIST'
      };
      const response = await api.post("/users", userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create panelist");
    }
  },

  getAllPanelists: async () => {
    try {
      try {
        const response = await api.get("/panelists");
        return response;
      } catch (panelistError) {
        const response = await api.get("/users?role=INTERVIEW_PANELIST");
        return response;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch panelists");
    }
  },

  updatePanelist: async (panelistId, updateData) => {
    try {
      return await api.put(`/users/${panelistId}`, updateData);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update panelist");
    }
  },

  deletePanelist: async (panelistId) => {
    try {
      return await api.delete(`/users/${panelistId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete panelist");
    }
  },

  getPanelistById: async (panelistId) => {
    try {
      return await api.get(`/users/${panelistId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch panelist");
    }
  },

  updatePanelistStatus: async (panelistId, status) => {
    try {
      return await api.put(`/users/${panelistId}/status?status=${status}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update panelist status");
    }
  }
};

export const availabilityApi = {
  submitAvailability: async (availabilityData) => {
    try {
      const response = await api.post("/panelists/availability", availabilityData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to submit availability");
    }
  },

  getMyAvailability: async () => {
    try {
      const response = await api.get("/panelists/availability");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch availability");
    }
  },

  getAssignedStudents: async () => {
    try {
      const response = await api.get("/panelists/assigned-students");
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch assigned students");
    }
  },

  updateAvailability: async (availabilityId, timeSlot) => {
    try {
      const response = await api.put(`/panelists/availability/${availabilityId}`, timeSlot);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update availability");
    }
  },

  deleteAvailability: async (availabilityId) => {
    try {
      const response = await api.delete(`/panelists/availability/${availabilityId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete availability");
    }
  },

  getAvailableSlots: async (startDate = null, endDate = null, slotDuration = 60) => {
    try {
      let url = "/panelists/available-slots";
      const params = new URLSearchParams();
      
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (slotDuration) params.append("slotDuration", slotDuration);
      
      if (params.toString()) {
        url += "?" + params.toString();
      }
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch available slots");
    }
  }
};

export const checkPasswordResetRequiredApi = (userId) => 
  api.get(`/auth/check-password-reset-required?userId=${userId}`);

export const adminForceUserResetApi = (userId) => 
  api.post(`/auth/admin/force-user-reset/${userId}`);

export const createUserApi = (userData) => api.post("/users", userData);
export const getAllUsersApi = () => api.get("/users");
export const updateUserStatusApi = (userId, status) =>
  api.put(`/users/${userId}/status?status=${status}`);

export const studentApi = {
  verifyEmail: (email) => 
    api.post("/students/verify-email", { email }),

  completeRegistration: (registrationData) =>
    api.post("/students/complete-registration", registrationData),

  uploadStudentsCSV: (file, uploadedBy) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadedBy", uploadedBy);
    
    return api.post("/students/upload-csv", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': undefined 
      }
    });
  },

  getAllStudents: () => api.get("/students"),

  getStudentsByRole: (role) => api.get(`/students/role/${role}`),

  getIncompleteRegistrations: () => api.get("/students/incomplete"),

  getStudentStatistics: () => api.get("/students/statistics"),

  getProfile: () => api.get("/students/profile"),

  updateProfile: (profileData) => api.put("/students/profile", profileData),

  uploadResume: (file) => {
    const formData = new FormData();
    formData.append("resume", file);
    
    return api.post("/students/resume", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },

  downloadResume: (studentId) => api.get(`/students/${studentId}/resume`, {
    responseType: 'blob'
  }),

  updateStudentStatus: (studentId, status) =>
    api.put(`/students/${studentId}/status`, { status }),

  deleteStudent: (studentId) => api.delete(`/students/${studentId}`),

  bulkUpdateStudents: (updates) => 
    api.put("/students/bulk-update", { updates }),

  exportStudents: (format = 'csv', filters = {}) =>
    api.post("/students/export", { format, filters }, {
      responseType: 'blob'
    }),

  searchStudents: (query, filters = {}) =>
    api.post("/students/search", { query, ...filters }),

  getStudentById: (studentId) => api.get(`/students/${studentId}`),

  resetStudentPassword: (studentId) =>
    api.post(`/students/${studentId}/reset-password`),
};

export const fileApi = {
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

  downloadFile: (fileId) => 
    api.get(`/files/${fileId}/download`, {
      responseType: 'blob'
    }),

  deleteFile: (fileId) => api.delete(`/files/${fileId}`),

  getFileInfo: (fileId) => api.get(`/files/${fileId}`),
};

export const verifyEmailApi = async (email) => {
  return await api.post("/students/verify-email", { email });
};

export const completeRegistrationApi = async (formData) => {
  return await api.post("/students/complete-registration", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;