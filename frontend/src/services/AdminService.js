import API from "../api/axios";

export const changeAdminPassword = async (data) => {
  return await API.put("/admin/change-password", data);
};
