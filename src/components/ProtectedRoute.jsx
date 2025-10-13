// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 ProtectedRoute checking auth...');
        
        // ✅ Direct localStorage check - no validation functions
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        console.log('Auth check:', { 
          hasToken: !!token, 
          hasRole: !!userRole,
          role: userRole 
        });
        
        // Check if authenticated (token and role exist)
        if (!token || !userRole) {
          console.log('❌ Not authenticated - missing token or role');
          setShouldRender(false);
          setIsChecking(false);
          return;
        }
        
        // Check role if required
        if (requiredRole) {
          const userRoleUpper = userRole.toUpperCase();
          const requiredRoleUpper = requiredRole.toUpperCase();
          
          console.log('🎭 Role check:', userRoleUpper, 'vs', requiredRoleUpper);
          
          if (userRoleUpper !== requiredRoleUpper) {
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
        
        // Clear auth data on error
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userId');
          localStorage.removeItem('userName');
        } catch (e) {
          console.error('Failed to clear storage:', e);
        }
        
        setShouldRender(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [requiredRole]);

  // Show loading state
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized
  if (!shouldRender) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userRole) {
      // Not authenticated - redirect to login
      console.log('Redirecting to login - no auth data');
      return <Navigate to="/login" replace />;
    } else {
      // Authenticated but wrong role - redirect to unauthorized
      console.log('Redirecting to unauthorized - wrong role');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;