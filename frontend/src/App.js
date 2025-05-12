import React, { useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LandingPage from "./pages/LandingPage";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import CallerDashboard from "./pages/CallerDashboard";
import Leads from "./pages/Leads";
import Lead1 from "./pages/Lead1";
import Excelupload from "./pages/Excelupload"; 
import FieldDashboard from "./pages/FieldDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManageCampaigns from "./pages/ManageCampaigns";
import ManageUsers from "./pages/ManageUsers";
import SearchPage from "./pages/Search";
import ProtectedRoute from "./components/ProtectedRoute";
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
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <ScrollToTop />
      <div className="flex min-h-screen">
        {/* Sidebar is conditionally rendered based on user login status */}
        {user?.isLoggedIn && <Sidebar role={user.role} />}
        <div className={user?.isLoggedIn ? "ml-64 flex-grow" : "w-full"}>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/landingpage" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />

              {/* Protected Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/caller-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["caller"]}>
                    <CallerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/field_employee-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["field_employee"]}>
                    <FieldDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manager-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["manager"]}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/campaigns"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageCampaigns />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lead1"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <Lead1 />
                  </ProtectedRoute>
                }
              />

              {/* 🆕 Excel Upload Route */}
              <Route
                path="/excelupload"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <Excelupload />
                  </ProtectedRoute>
                }
              />

              {/* 🆕 Manage Users Route */}
              <Route
                path="/admin/manage-users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageUsers />
                  </ProtectedRoute>
                }
              />

              {/* 🆕 Search Route */}
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}

export default App;
