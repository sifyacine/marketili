import api from "./api";

/**
 * authService — wraps all auth-related API calls.
 * Components call these functions instead of calling axios directly.
 * This keeps API logic out of components.
 */
const authService = {
  /**
   * register — creates a new user account
   * @param {string} role - "client" | "agency" | "team" | "freelancer"
   * @param {object} data - all registration form fields
   */
  register: async (role, data) => {
    const response = await api.post("/auth/register", { role, ...data });
    return response.data;
    // Returns: { success: true, token: "...", user: {...} }
  },

  /**
   * login — authenticates and returns a token
   */
  login: async (email, password, role) => {
    const response = await api.post("/auth/login", { email, password, role });
    return response.data;
  },

  /**
   * getMe — fetches the current user from the server
   * Used to restore session on app startup
   */
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * logout — server-side cleanup + local cleanup
   */
  logout: async () => {
    await api.post("/auth/logout");
  },
};

export default authService;