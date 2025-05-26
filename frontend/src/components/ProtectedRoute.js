import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const currentRole = role?.toLowerCase();
    
    const hasAccess = token && currentRole && allowedRoles.includes(currentRole);
    
    if (!hasAccess) {
      navigate('/login', { state: { from: location } });
    }
  }, [allowedRoles, location, navigate]);

  return children;
};

export default ProtectedRoute;