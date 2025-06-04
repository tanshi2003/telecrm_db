// src/pages/Landing.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Logo3D from '../components/Logo3D';
import '../styles/Logo3D.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Lead Tracking',
      text: 'Track and manage all your leads efficiently with detailed insights and real-time updates.',
      icon: '📈'
    },
    {
      title: 'Campaign Management',
      text: 'Plan, execute, and monitor targeted campaigns to maximize your marketing ROI.',
      icon: '🎯'
    },
    {
      title: 'User Roles',
      text: 'Assign roles, manage team tasks, and ensure accountability across your organization.',
      icon: '👥'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Active Users' },
    { number: '50K+', label: 'Leads Managed' },
    { number: '95%', label: 'Customer Satisfaction' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative">        <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a] to-blue-400 opacity-90"></div>
        <div className="relative z-10 flex flex-col min-h-screen">          <div className="flex-grow container mx-auto px-4 py-24">            <div className="flex flex-row items-center justify-between max-w-7xl mx-auto">
              {/* Left side content */}
              <div className="w-1/2 text-left text-white space-y-9 pr-8 pt-18">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  Transform Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                    Customer Relations
                  </span>
                </h1>
                <p className="text-xl md:text-2xl opacity-90 max-w-xl">
                  Streamline lead management and boost customer interactions with our powerful CRM solution.
                </p>
                <div className="flex space-x-6 pt-8">
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-[#1e3a8a] px-8 py-4 rounded-full text-lg font-semibold hover:bg-opacity-90 transition transform hover:scale-105 hover:shadow-xl shadow-lg"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => navigate('/contact')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-[#1e3a8a] transition transform hover:scale-105"
                  >
                    Learn More
                  </button>
                </div>
              </div>              {/* Right side logo */}
              <div className="w-1/2 flex justify-center items-start pt-20">
                <div className="logo-3d w-full max-w-2xl">
                  <Logo3D />
                  <div className="logo-shadow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Powerful Features for Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition transform hover:scale-105 border border-gray-100"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
