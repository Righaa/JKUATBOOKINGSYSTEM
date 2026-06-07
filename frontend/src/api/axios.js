import axios from "axios";

const API = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";

      if (
        !url.includes("/auth/login") &&
        !url.includes("/auth/doctor-login") &&
        !url.includes("/auth/register")
      ) {
        localStorage.removeItem("token");
        const loginPath = window.location.pathname.startsWith("/doctor")
          ? "/doctor/login"
          : "/login";
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
