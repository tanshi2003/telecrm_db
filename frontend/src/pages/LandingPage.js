import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-r from-white via-blue-200 to-darkblue text-black min-h-screen flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="text-center p-10">
        <motion.h1
          className="text-6xl font-extrabold mb-6 text-darkblue"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Welcome to TeleCRM
        </motion.h1>
        <p className="text-xl text-gray-800 max-w-2xl mx-auto">
          A powerful CRM solution designed to streamline lead management, improve customer interactions, and boost productivity.
        </p>
        <motion.button
          className="mt-8 px-8 py-4 bg-darkblue text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          whileHover={{ scale: 1.05 }}
          onClick={handleGetStarted}
        >
          Get Started
        </motion.button>
      </section>

      {/* Features Section */}
      <section className="mt-20 w-4/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center">
        <motion.div
          className="bg-white text-darkblue p-8 rounded-lg shadow-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Lead Tracking</h2>
          <p className="text-gray-600">Effortlessly track and manage all your leads in one place.</p>
        </motion.div>
        <motion.div
          className="bg-white text-darkblue p-8 rounded-lg shadow-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Campaign Management</h2>
          <p className="text-gray-600">Run targeted campaigns and monitor their performance.</p>
        </motion.div>
        <motion.div
          className="bg-white text-darkblue p-8 rounded-lg shadow-xl"
          whileHover={{ scale: 1.05 }}
        >
          <h2 className="text-2xl font-semibold mb-4">User Roles</h2>
          <p className="text-gray-600">Assign roles and manage team responsibilities seamlessly.</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-20 p-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} TeleCRM. All Rights Reserved.
      </footer>
    </div>
  );
};

export default LandingPage;