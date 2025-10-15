import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/initialpages/LoginPage.jsx";
import RegistrationPage from "./pages/initialpages/RegistrationPage.jsx";
import ForgotPassword from "./pages/initialpages/ForgotPassword.jsx";
import AdminDashboard from "./pages/rolebasedpages/admin/AdminDashboard.jsx";
import HrDashboard from "./pages/rolebasedpages/hr/HrDashboard.jsx";
import FacultyDashboard from "./pages/rolebasedpages/Faculty/FacultyDashboard.jsx";
import ResetPassword from "./pages/initialpages/ResetPassword.jsx";
// import InterviewPanelist from "./pages/rolebasedpages/hr/interviewmanagement/interviewpanelistpage/InterviewPanelist.jsx";
import StudentAvailabilityPage from "./pages/rolebasedpages/hr/interviewmanagement/availabiltypages/StudentAvailability.jsx";
import InterviewPanelistPortal from "./pages/rolebasedpages/hr/interviewmanagement/availabiltypages/InterviewPanelistPortal.jsx";
//import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router >
      <Routes>
        {/* Login routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />  {/* 👈 MUST BE PUBLIC */}
       {/* Dashboard routes */}
        <Route path="/admin-dashboard"  element={
           
              <AdminDashboard />
          
          }  />
        <Route path="/hr-dashboard" element={<HrDashboard />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path ="/interview-panelist" element={<InterviewPanelist/>}/>
        <Route path ="/student-availability" element={<StudentAvailabilityPage/>}/>
        <Route path ="/interviewpaenlist-portal" element={<InterviewPanelistPortal/>}/>
        {/* Legacy redirects */}
       
        <Route
  path="/rolebasedpages/admin/admindashboard"
  element={
      <Navigate to="/admin-dashboard" replace />
   
  }
/>  <Route
  path="/rolebasedpages/hr/interviewmanagement/availabilitypages/interviewpaenlist-portal"
  element={<InterviewPanelistPortal />}/>

        <Route
          path="/rolebasedpages/hr/hrdashboard"
          element={<Navigate to="/hr-dashboard" replace />}
        />
        <Route
          path="/rolebasedpages/faculty/facultydashboard"
          element={<Navigate to="/faculty-dashboard" replace />}
        />
        

        {/* Catch-all redirect to login */}
         {/* 404 Not Found - Only for truly unknown routes */}
         <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a href="/login" className="text-blue-600 hover:underline">
                  Go to Login
                </a>
              </div>
            </div>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;
