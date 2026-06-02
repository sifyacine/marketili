// frontend/src/services/authService.js
import api from "./api";

const authService = {
  register: (role, data) =>
    api.post("/auth/register", { role, ...data }).then(r => r.data),

  // ✅ role removed — backend auto-detects from email
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then(r => r.data),

  getMe: () =>
    api.get("/auth/me").then(r => r.data),

  logout: () =>
    api.post("/auth/logout").then(r => r.data),
};

export default authService;