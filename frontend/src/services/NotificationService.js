import API from "../api/axios";

export const getNotifications = async () => {
  return await API.get("/notifications");
};

export const markAsRead = async (id) => {
  return await API.put(`/notifications/${id}/read`);
};
