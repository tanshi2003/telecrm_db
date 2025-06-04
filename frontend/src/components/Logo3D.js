import React from 'react';

const Logo3D = () => {
  return (
    <div className="logo-container">
      <div className="logo-inner">
        <div className="headset-icon">
          <svg width="65" height="65" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g className="headset-3d">
              {/* Main circle */}
              <circle cx="25" cy="25" r="24" fill="#60A5FA"/>
              {/* Person */}
              <circle cx="25" cy="20" r="8" fill="white"/>
              {/* Headset and mic */}
              <path d="M12 24C12 17 17 11 25 11C33 11 38 17 38 24" 
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M10 24V30C10 32.2091 11.7909 34 14 34H16" 
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M40 24V30C40 32.2091 38.2091 34 36 34H34" 
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M19 34C19 31 22 29 25 29C28 29 31 31 31 34" 
                stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </g>
          </svg>
        </div>
        <div className="logo-text">CRM.io</div>
      </div>
    </div>
  );
};

export default Logo3D;
