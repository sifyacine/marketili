import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // ✅ sends the httpOnly cookie on every request
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    const isMeCheck = error.config?.url?.includes("/auth/me");

    // Only force-redirect on 401s that are NOT the silent session check
    // The /me 401 is expected when logged out — useAuth handles it gracefully
    if (is401 && !isMeCheck) {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;