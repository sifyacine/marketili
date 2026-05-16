// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import PrivateRoute       from "./components/auth/PrivateRoute";
import Login              from "./pages/auth/Login";
import Register           from "./pages/auth/Register";
import Unauthorized       from "./pages/auth/Unauthorized";
import ClientDashboard    from "./pages/dashboard/ClientDashboard";
import AgencyDashboard    from "./pages/dashboard/AgencyDashboard";
import AdminDashboard     from "./pages/dashboard/AdminDashboard";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import ProfilePage        from "./pages/ProfilePage";
import EditProfilePage    from "./pages/EditProfilePage";
import BrowseProvidersPage from "./pages/BrowseProvidersPage";
//uuyou
let LandingPage;
try {
  LandingPage = require("./pages/LandingPage").default;
} catch {
  LandingPage = () => <Navigate to="/login" replace />;
}

const ComingSoon = ({ role }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
    minHeight:"100vh", background:"#fff5f5", flexDirection:"column", gap:16 }}>
    <div style={{ fontSize:"2.5rem" }}>{role==="team"?"👥":"⚡"}</div>
    <h2 style={{ color:"#1a0a0a", fontWeight:800 }}>Dashboard {role}</h2>
    <p style={{ color:"#7a4a4a", fontSize:"0.9rem" }}>Phase suivante — bientôt disponible</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"             element={<LandingPage />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ✅ Admin handles its own auth internally — no PrivateRoute */}
        <Route path="/admin"        element={<AdminDashboard />} />

        // Add as a public route (no PrivateRoute wrapper — member is logged in but forced here):
        <Route path="/change-password" element={<ChangePasswordPage />} />   

        <Route path="/dashboard/client/*" element={
          <PrivateRoute allowedRoles={["client"]}>
            <ClientDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/agency/*" element={
          <PrivateRoute allowedRoles={["agency","agency_member"]}>
            <AgencyDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/team/*" element={
          <PrivateRoute allowedRoles={["team","team_member"]}>
            <ComingSoon role="team" />
          </PrivateRoute>
        } />
        <Route path="/dashboard/freelancer/*" element={
          <PrivateRoute allowedRoles={["freelancer"]}>
            <ComingSoon role="freelancer" />
          </PrivateRoute>
        } />

        {/* Public profile & browse routes */}
        <Route path="/profile/:role/:id/edit" element={<EditProfilePage />} />
        <Route path="/profile/:role/:id"      element={<ProfilePage />} />
        <Route path="/browse"                 element={<BrowseProvidersPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;