import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const role = Number(user.user_role);

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    switch (role) {
      case 0: return <Navigate to="/user" replace />;
      case 1: return <Navigate to="/admin" replace />;
      case 2: return <Navigate to="/hospital" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }


  return children;
};

export default ProtectedRoute;
