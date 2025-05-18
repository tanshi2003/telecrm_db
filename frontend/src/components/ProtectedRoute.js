import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();
  const location = useLocation();

  console.log("ProtectedRoute - Checking access for path:", location.pathname);
  console.log("ProtectedRoute - Current role:", role);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Has token:", !!token);
  console.log("ProtectedRoute - Local storage state:", {
    token: !!token,
    role,
    user: localStorage.getItem("user")
  });

  if (!token) {
    console.log("ProtectedRoute - No token, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    console.log("ProtectedRoute - Role not allowed, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;