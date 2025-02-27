import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Navbar from "./components/Navbar";
import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { AnimatePresence } from "framer-motion";

function App() {
  return (
    <Router>
      <Navbar />
      <AnimatePresence>
        <Routes>
          <Route path="/" element={<LandingPage />} />  {/* Set LandingPage as default */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/LandingPage" element={<LandingPage />} /> {/* Ensure this route is defined */}
          <Route path="/Contact" element={<Contact />} /> {/* Add ContactUs route */}
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;