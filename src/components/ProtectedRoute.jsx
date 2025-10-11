// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, clearAuthData } from '../api/authApi.js';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 ProtectedRoute checking auth...');
        
        const authenticated = isAuthenticated();
        console.log('Auth result:', authenticated);
        
        if (!authenticated) {
          console.log('❌ Not authenticated');
          setShouldRender(false);
          setIsChecking(false);
          return;
        }
        
        if (requiredRole) {
          const user = getCurrentUser();
          const userRole = user?.role?.toUpperCase();
          const requiredRoleUpper = requiredRole.toUpperCase();
          
          console.log('🎭 Role check:', userRole, 'vs', requiredRoleUpper);
          
          if (!user || userRole !== requiredRoleUpper) {
            console.log('❌ Role mismatch');
            setShouldRender(false);
            setIsChecking(false);
            return;
          }
        }
        
        console.log('✅ All checks passed');
        setShouldRender(true);
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        clearAuthData();
        setShouldRender(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  if (!shouldRender) {
    const authenticated = isAuthenticated();
    if (!authenticated) {
      return <Navigate to="/admin-login" replace />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
