import React, { useState } from 'react';
import { 
  LoginPage, 
  RegistrationPage, 
  ForgotPassword, 
  ResetPassword 
} from './pages/initialpages';
import './styles/globals.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const switchPage = (page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onSwitch={switchPage} />;
      case 'register':
        return <RegistrationPage onSwitch={switchPage} />;
      case 'forgot':
        return <ForgotPassword onSwitch={switchPage} />;
      case 'reset':
        return <ResetPassword onSwitch={switchPage} />;
      default:
        return <LoginPage onSwitch={switchPage} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
}

export default App;

