import API from "../api/axios";

export const getDashboardStats = async () => {
  return await API.get("/dashboard/stats");
};

export const getRecentAppointments = async () => {
  return await API.get("/appointments/recent");
};
