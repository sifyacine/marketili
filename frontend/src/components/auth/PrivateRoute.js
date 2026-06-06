

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";







const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", background: "#fff5f5", flexDirection: "column", gap: 12,
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid #fae0e0", borderTopColor: "#c0152a",
          borderRadius: "50%", animation: "spin 0.7s linear infinite",
        }} />
        <p style={{ color: "#9a6060", fontSize: "0.85rem" }}>Chargement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default PrivateRoute;
