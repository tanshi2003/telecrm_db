// src/pages/Landing.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer'; // Import Footer component

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Main Content */}
      <div className="flex-grow text-center px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to TeleCRM</h1>
        <p className="text-gray-600 text-lg mb-8">
          A powerful CRM solution to streamline lead management and improve customer interactions.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full text-lg font-semibold shadow hover:opacity-90 transition"
        >
          Get Started
        </button>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[{title: 'Lead Tracking', text: 'Track and manage all your leads efficiently with detailed insights and real-time updates.'},
            {title: 'Campaign Management', text: 'Plan, execute, and monitor targeted campaigns to maximize your marketing ROI.'},
            {title: 'User Roles', text: 'Assign roles, manage team tasks, and ensure accountability across your organization.'}]
            .map((card, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-2xl shadow-lg transition transform hover:scale-105"
              >
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-sm">{card.text}</p>
              </div>
            ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
