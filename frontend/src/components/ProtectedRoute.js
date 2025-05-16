import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  console.log("ProtectedRoute - Current role:", role);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Has token:", !!token);

  if (!token) {
    console.log("ProtectedRoute - No token, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    console.log("ProtectedRoute - Role not allowed, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;