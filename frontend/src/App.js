// frontend/src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Auth components (no Context — uses useAuth hook)
import PrivateRoute from "./components/auth/PrivateRoute";

// Public pages
import Login        from "./pages/auth/Login";
import Register     from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";

// Dashboards  (add others as phases complete)
import ClientDashboard from "./pages/dashboard/ClientDashboard";

// NOTE: LandingPage left out until it is confirmed present.
// Replace the "/" route below once LandingPage.jsx is in src/pages/

// Placeholder for dashboards not yet built
const ComingSoon = ({ role }) => (
  <div style={{
    display:"flex", alignItems:"center", justifyContent:"center",
    minHeight:"100vh", background:"#fff5f5", flexDirection:"column", gap:16,
  }}>
    <div style={{ fontSize:"2.5rem" }}>
      {role==="agency"?"🏢":role==="team"?"👥":"⚡"}
    </div>
    <h2 style={{ color:"#1a0a0a", fontWeight:800 }}>Dashboard {role}</h2>
    <p style={{ color:"#7a4a4a", fontSize:"0.9rem" }}>Phase suivante — bientôt disponible</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public ── */}
        <Route path="/"             element={<Navigate to="/login" replace />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ── Client dashboard (nested routes) ── */}
        <Route
          path="/dashboard/client/*"
          element={
            <PrivateRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </PrivateRoute>
          }
        />

        {/* ── Other dashboards — Phase 3+ ── */}
        <Route
          path="/dashboard/agency/*"
          element={
            <PrivateRoute allowedRoles={["agency","agency_member"]}>
              <ComingSoon role="agency" />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/team/*"
          element={
            <PrivateRoute allowedRoles={["team","team_member"]}>
              <ComingSoon role="team" />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/freelancer/*"
          element={
            <PrivateRoute allowedRoles={["freelancer"]}>
              <ComingSoon role="freelancer" />
            </PrivateRoute>
          }
        />

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;