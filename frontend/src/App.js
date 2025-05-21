import React, { useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import Viewlead from "./pages/Viewlead";
import EditLead from "./pages/EditLead";
import EditUser from "./pages/EditUser";
import Updatelead from "./pages/Updatelead";
import FieldDashboard from "./pages/FieldDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import EditCampaign from "./pages/EditCampaign";
import AssignUser from './pages/AssignUser';
import UpdateCampaign from "./pages/UpdateCampaign";
import ManageCampaigns from "./pages/ManageCampaigns";
import Campaign from "./pages/Campaign";
import ManageUsers from "./pages/ManageUser";
import SearchPage from "./pages/Search";
import FiltersPage from "./pages/Filters"; // Use the page version
import AddUser from "./pages/Register";
import AllUsers from "./pages/AllUsers";
import AccessLogs from "./pages/AccessLogs";
import ManageRoles from "./pages/ManageRoles";
import ManageStatus from "./pages/ManageStatus";
import AssignManager from "./pages/AssignManager"; // <-- Add this import
import TeamsList from "./pages/TeamsList";
import TeamManagement from "./pages/team-management";
import Meetings from "./pages/Meetings";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/ReportsLeaderboard";
import ManagerUserManagement from "./pages/ManagerUserManagement";
import TeamView from "./pages/TeamView";
import ViewTeam from "./pages/ViewTeam";
import LeadAssignment from "./pages/LeadAssignment";
import "./styles/global.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from 'react-hot-toast';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Wrap the main app content in this component to handle route changes
function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Add route change logging and handling
  useEffect(() => {
    // If someone tries to navigate to /admin-dashboard, redirect to /admin
    if (location.pathname === "/admin-dashboard") {
      navigate("/admin");
    }
  }, [location, user, navigate]);

  return (
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
            <Route path="/Updatelead" element={<Updatelead />} />

            {/* Admin/User Management Routes */}
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/users/register" element={<AddUser />} />
            <Route path="/admin/users/all-user" element={<AllUsers />} />
            <Route path="/admin/users/access-logs" element={<AccessLogs />} />
            <Route path="/admin/users/manage-roles" element={<ManageRoles />} />
            <Route path="/admin/users/manage-status" element={<ManageStatus />} />
            <Route
              path="/admin/users/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <EditUser />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/ManageUsers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/admin"
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
              path="/manager/users"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerUserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/team-view"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <TeamView />
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
              path="/admin/campaigns"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ManageCampaigns />
                </ProtectedRoute>
              }
            />
             <Route
              path="/admin/campaigns1"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Campaign />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assignuser"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AssignUser />
                </ProtectedRoute>
              }
            />
           <Route 
           path="/admin/UpdateCampaign/:id" 
           element={
             <ProtectedRoute allowedRoles={["admin"]}>
           <UpdateCampaign /> 
           
</ProtectedRoute>
              }
            />
            <Route 
           path="/admin/EditCampaign/:id" 
           element={
             <ProtectedRoute allowedRoles={["admin"]}>
           <EditCampaign /> 
           
</ProtectedRoute>
              }
            />
            <Route
              path="/Lead1"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager", "caller", "field_employee"]}>
                  <Lead1 />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewlead/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <Viewlead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editlead/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <EditLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Updatelead/:id"
              element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                  <Updatelead />
                </ProtectedRoute>
              }
            />
            <Route
                path="/team-management"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <TeamManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/meetings"
                element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <Meetings />
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
             <Route
              path="/ReportsLeaderboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            {/* 🆕 Search Route */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/filters" element={<FiltersPage />} />
            <Route
              path="/admin/users/assign-manager"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AssignManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/teams"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <TeamsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users/teams/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <ViewTeam />
                </ProtectedRoute>
              }
            />

            {/* Manager team routes */}
            <Route
              path="/manager/teams"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <TeamsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager/teams/:id"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ViewTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lead-assignment"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <LeadAssignment />
                </ProtectedRoute>
              }
            />

            {/* Add catch-all routes for old paths */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Navigate to="/admin" replace />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: '1px solid #4ade80',
            padding: '12px',
            color: '#16a34a',
          },
          iconTheme: {
            primary: '#16a34a',
            secondary: '#f0fdf4',
          },
        }}
      />
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </>
  );
}

export default App;
