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
import FreelancerDashboard from "./pages/dashboard/FreelancerDashboard";
import TeamDashboard from "./pages/dashboard/TeamDashboard";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import VerifyEmailPage    from "./pages/auth/VerifyEmailPage";
import ProfilePage        from "./pages/ProfilePage";
import EditProfilePage    from "./pages/EditProfilePage";
import BrowseProvidersPage from "./pages/BrowseProvidersPage";
import BillingPage         from "./pages/BillingPage";
import PricingPage         from "./pages/PricingPage";
//uuyou
let LandingPage;
try {
  LandingPage = require("./pages/LandingPage").default;
} catch {
  LandingPage = () => <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"             element={<LandingPage />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/register"     element={<Register />} />
        <Route path="/pricing"      element={<PricingPage />} />
        <Route path="/tarifs"       element={<PricingPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* ✅ Admin handles its own auth internally — no PrivateRoute */}
        <Route path="/admin"        element={<AdminDashboard />} />

        {/* Public route (no PrivateRoute wrapper — member is logged in but forced here) */}
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
            <TeamDashboard />
          </PrivateRoute>
        } />
        <Route path="/dashboard/freelancer/*" element={
          <PrivateRoute allowedRoles={["freelancer"]}>
            <FreelancerDashboard />
          </PrivateRoute>
        } />

        {/* Subscription / billing — any authenticated role */}
        <Route path="/billing" element={
          <PrivateRoute>
            <BillingPage />
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