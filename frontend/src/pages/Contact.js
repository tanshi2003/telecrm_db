import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Footer from '../components/Footer';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/contact`, { name, email, message });
      alert('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      alert('Failed to send message.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white via-blue-100 to-white text-black">
      {/* Main Content */}      <div className="flex-grow flex flex-col items-center py-20">
        {/* Hero Section */}
        <section className="text-center px-4 py-12">
          <motion.h1
            className="text-4xl font-bold mb-4 text-[#1e3a8a]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Contact Us
          </motion.h1>
          <p className="text-lg text-gray-700 max-w-md mx-auto">
            We're here to help. Get in touch with us for any queries or support.
          </p>
        </section>

        {/* Contact Form */}
        <section className="w-full max-w-md bg-white p-4 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-darkblue font-medium mb-1" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-darkblue font-medium mb-1" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-darkblue font-medium mb-1" htmlFor="message">Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="4"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-900 text-white font-bold rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              Send Message
            </button>
          </form>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;
