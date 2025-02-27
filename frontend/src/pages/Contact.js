import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contact', { name, email, message });
      alert('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      alert('Failed to send message.');
    }
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
          Contact Us
        </motion.h1>
        <p className="text-xl text-gray-800 max-w-2xl mx-auto">
          We're here to help. Get in touch with us for any queries or support.
        </p>
      </section>

      {/* Contact Form */}
      <section className="mt-10 w-4/5 max-w-lg bg-white p-8 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-darkblue font-bold mb-2" htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-darkblue font-bold mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-6">
            <label className="block text-darkblue font-bold mb-2" htmlFor="message">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows="5"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-darkblue text-white font-bold rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="mt-20 p-6 text-center text-gray-400">
        &copy; {new Date().getFullYear()} TeleCRM. All Rights Reserved.
      </footer>
    </div>
  );
};

export default Contact;