import { useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

// ── Module-level singleton state ──────────────────────────────────────────────

let _user    = null;
let _role    = null;
let _loading = true;
const _listeners = new Set();

const notify = () => _listeners.forEach((fn) => fn());

const setShared = (user, role, loading) => {
  _user    = user;
  _role    = role;
  _loading = loading;
  notify();
};

// Kick off the /me check once
let _initialized = false;
const init = () => {
  if (_initialized) return;
  _initialized = true;

  authService.getMe()
    .then((data) => {
      const u = data.user;
      setShared(u, u?.role || null, false); // ✅ FIXED
    })
    .catch(() => {
      setShared(null, null, false);
    });
};

// ── Hook ─────────────────────────────────────────────────────────────────────

const useAuth = () => {
  const [, rerender] = useState(0);

  useEffect(() => {
    const listener = () => rerender((n) => n + 1);
    _listeners.add(listener);

    init();

    return () => _listeners.delete(listener);
  }, []);

  const login = useCallback((userData, userRole) => {
    setShared(userData, userRole || userData?.role || null, false); // ✅ FIXED
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (_) {
      // ignore
    } finally {
      setShared(null, null, false);
    }
  }, []);

  const updateUser = useCallback((patch) => {
    setShared({ ..._user, ...patch }, _role, false);
  }, []);

  return {
    user:            _user,
    role:            _role,
    loading:         _loading,
    isAuthenticated: !!_user,
    isClient:        _role === "client",
    isAgency:        _role === "agency",
    isAgencyMember:  _role === "agency_member",
    isTeam:          _role === "team",
    isTeamMember:    _role === "team_member",
    isFreelancer:    _role === "freelancer",
    isProvider:      ["agency", "team", "freelancer", "agency_member", "team_member"].includes(_role),
    login,
    logout,
    updateUser,
  };
};

export default useAuth;