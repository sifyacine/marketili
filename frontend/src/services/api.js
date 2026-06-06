import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, 
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const is401 = error.response?.status === 401;
    const isMeCheck = error.config?.url?.includes("/auth/me");

    
    
    if (is401 && !isMeCheck) {
      const onBillingOrPricing = window.location.pathname.startsWith("/billing") ||
        window.location.pathname.startsWith("/pricing");
      if (!onBillingOrPricing) {
        window.location.href = "/login";
      }
    }

    
    const is402 = error.response?.status === 402;
    if (is402 && error.response?.data?.code === "SUBSCRIPTION_REQUIRED") {
      if (!window.location.pathname.startsWith("/billing")) {
        window.location.href = "/billing";
      }
    }

    return Promise.reject(error);
  }
);

export default api;