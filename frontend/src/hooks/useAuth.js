// frontend/src/hooks/useAuth.js

import { useState, useEffect, useCallback } from "react";

/**
 * useAuth — simple auth hook using localStorage only.
 * No Context, no module-level state, no listeners.
 * Each component reads directly from localStorage.
 */

const useAuth = () => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });
  const [role,    setRole]    = useState(() => localStorage.getItem("role") || null);
  const [token,   setToken]   = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  const login = useCallback((userData, userRole, userToken) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("user",  JSON.stringify(userData));
    localStorage.setItem("role",  userRole);
    setUser(userData);
    setRole(userRole);
    setToken(userToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((patch) => {
    const updated = { ...user, ...patch };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  }, [user]);

  return {
    user,
    role,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isClient:        role === "client",
    isAgency:        role === "agency",
    isAgencyMember:  role === "agency_member",
    isTeam:          role === "team",
    isTeamMember:    role === "team_member",
    isFreelancer:    role === "freelancer",
    isProvider:      ["agency","team","freelancer","agency_member","team_member"].includes(role),
    login,
    logout,
    updateUser,
  };
};

export default useAuth;