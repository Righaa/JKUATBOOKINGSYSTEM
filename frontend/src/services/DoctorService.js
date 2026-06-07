import API from "../api/axios";
import { mapDoctor, mapDoctorForApi } from "../utils/apiHelpers";

export const getDoctors = async (specialty) => {
  const params = specialty ? { specialty } : {};
  const res = await API.get("/doctors", { params });
  return { ...res, data: res.data.map(mapDoctor) };
};

export const getSpecialties = async () => {
  return await API.get("/doctors/specialties");
};

export const getDoctorById = async (id) => {
  const res = await API.get(`/doctors/${id}`);
  return { ...res, data: mapDoctor(res.data) };
};

export const createDoctor = async (data) => {
  return await API.post("/doctors", mapDoctorForApi(data));
};

export const updateDoctor = async (id, data) => {
  return await API.put(`/doctors/${id}`, mapDoctorForApi(data));
};

export const deleteDoctor = async (id) => {
  return await API.delete(`/doctors/${id}`);
};
