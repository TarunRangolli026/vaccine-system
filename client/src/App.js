import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard'; 
import AdminDashboard from './admin/AdminDashboard'; 
import ResetPassword from './ResetPassword'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // 1. IMPROVED CHECK: Check URL immediately
    if (window.location.pathname.startsWith('/reset-password/')) {
      setIsResetting(true);
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser && savedUser !== "undefined") {
      try {
        setUserData(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('user'); 
      }
    }
  }, []);

  const handleLoginSuccess = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    setUserData(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserData(null);
    window.location.href = "/";
  };

  // 2. NEW FUNCTION: To switch back to Login after reset is done
  const handleBackToLogin = () => {
    setIsResetting(false);
    window.history.pushState({}, '', '/'); // Clears the token from the URL bar
  };

  return (
    <div className="App">
      {/* 3. Pass handleBackToLogin to the ResetPassword component */}
      {isResetting ? (
        <ResetPassword onComplete={handleBackToLogin} />
      ) : !isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {userData?.role === 'admin' ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Dashboard 
              user={userData} 
              onLogout={handleLogout} 
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;