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
import ManageUsers from "./pages/manage-user";
import SearchPage from "./pages/Search";
import RegisterUser from "./pages/RegisterUser";
import AllUsers from "./pages/AllUsers";
import AccessLogs from "./pages/AccessLogs"
import ManageRoles from "./pages/ManageRoles";
import ManageStatus from "./pages/ManageStatus";
import EmployeeProfile from "./pages/EmployeeProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
// import RegisterUser from "./pages/RegisterUser";

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
              <Route path="/admin/users" element={<ManageUsers/>} />
              <Route path="/admin/users/register" element={<RegisterUser/>} />
              <Route path="/admin/users/all-user" element={<AllUsers/>} />
              <Route path="/admin/users/access-logs" element={<AccessLogs/>} />
              <Route path="/admin/users/manage-roles" element={<ManageRoles/>} />
              <Route path="/admin/users/manage-status" element={<ManageStatus/>} />
              <Route path="/admin/users/employee-profile" element={<EmployeeProfile/>} />
              
              


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
