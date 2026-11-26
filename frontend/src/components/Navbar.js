import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();
  useEffect(() => {
    const checkLoginStatus = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', checkLoginStatus);
    const intervalId = setInterval(checkLoginStatus, 1000);
    return () => { window.removeEventListener('storage', checkLoginStatus); clearInterval(intervalId); };
  }, []);
  return (
    <nav className={`telecrm-navbar fixed top-0 left-0 w-full z-50 flex justify-between items-center ${isLoggedIn ? 'logged-in' : ''}`}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/landingpage')}>
        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">T</div>
        <h1 className="brand-title m-0">TeleCRM<span>.io</span></h1>
      </div>
      {!isLoggedIn && <div className="flex items-center gap-1 sm:gap-3">
        <button onClick={() => navigate('/landingpage')} className="nav-link-btn hidden sm:inline-flex">About</button>
        <button onClick={() => navigate('/contact')} className="nav-link-btn hidden sm:inline-flex">Contact</button>
        <button onClick={() => navigate('/login')} className="nav-link-btn login-link inline-flex items-center gap-2">Sign in <ArrowRight size={15}/></button>
      </div>}
    </nav>
  );
};
export default Navbar;