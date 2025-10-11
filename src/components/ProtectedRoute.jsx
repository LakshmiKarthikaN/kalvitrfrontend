// ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, clearAuthData } from './api/auth';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  useEffect(() => {
    // Add error boundary for this component
    const handleError = (error) => {
      if (error.message && error.message.includes('atob')) {
        console.warn('Token error in protected route, clearing data');
        clearAuthData();
        window.location.href = '/login';
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  try {
    const authenticated = isAuthenticated();
    
    if (!authenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole) {
      const user = getCurrentUser();
      if (!user || user.role !== requiredRole) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    
    return children;
  } catch (error) {
    console.error('Protected route error:', error);
    clearAuthData();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
