// src/components/Navbar.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white px-4 py-2 flex justify-between items-center shadow-md"> {/* Reduced padding */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/landing')}>
        <img src="/assets/icons/logo.png" alt="CRM Logo" className="h-8" /> {/* Reduced logo height */}
        <h1 className="text-xl font-bold font-['Kiwi_Maru']"> {/* Reduced font size */}
          CRM<span className="italic font-cursive text-white">.io</span>
        </h1>
      </div>
      <div className="space-x-3 text-base font-['Open_Sans']"> {/* Adjusted spacing and font size */}
        <button onClick={() => navigate('/landingpage')} className="hover:text-gray-300">About Us</button>
        <button onClick={() => navigate('/contact')} className="hover:text-gray-300">Contact Us</button>
        {!isLoggedIn && (
          <button onClick={() => navigate('/login')} className="hover:text-gray-300">Login</button>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
