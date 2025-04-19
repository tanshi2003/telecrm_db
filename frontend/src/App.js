import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard"; 
import UserDashboard from "./pages/UserDashboard"; 
import Leads from "./pages/Leads";
import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <Navbar /> {/* Navbar remains persistent across all routes */}
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} /> {/* Default route to LandingPage */}
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
          <Route path="/user-dashboard" element={<UserDashboard />} /> 
          <Route path="/leads" element={<Leads />} />
          <Route path="/contact" element={<Contact />} /> 
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
