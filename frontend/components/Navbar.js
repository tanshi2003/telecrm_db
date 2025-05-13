import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Listen to changes in localStorage (in case of multiple tabs)
    window.addEventListener('storage', checkLoginStatus);

    // Optional: Interval checker (useful in same-tab updates)
    const intervalId = setInterval(checkLoginStatus, 1000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <nav className="text-white px-3 py-2 flex justify-between items-center shadow-md fixed top-0 left-0 w-full z-50" style={{ backgroundColor: '#1e3a8a' }}>
      {/* Logo Section */}
      <div
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => navigate('/landing')}
      >
        <img src="/assets/icons/logo.png" alt="CRM Logo" className="h-8" />
        <h1 className="text-xl font-bold font-['Kiwi_Maru']">
          CRM<span className="italic font-cursive text-white">.io</span>
        </h1>
      </div>

      {/* Navigation Links */}
      {!isLoggedIn && (
        <div className="space-x-3 text-base font-['Open_Sans']">
          <button onClick={() => navigate('/landingpage')} className="hover:text-gray-300">
            About Us
          </button>
          <button onClick={() => navigate('/contact')} className="hover:text-gray-300">
            Contact Us
          </button>
          <button onClick={() => navigate('/login')} className="hover:text-gray-300">
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
