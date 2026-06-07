import API from "../api/axios";
import { mapAppointment } from "../utils/apiHelpers";

export const getPatientProfile = async () => {
  return await API.get("/patients/profile");
};

export const updatePatientProfile = async (data) => {
  return await API.put("/patients/profile", data);
};

export const changePatientPassword = async (data) => {
  return await API.put("/patients/change-password", data);
};

export const getPatientAppointments = async () => {
  const res = await API.get("/patients/appointments");
  return { ...res, data: res.data.map(mapAppointment) };
};

export const getPatientMedicalRecords = async () => {
  return await API.get("/patients/medical-records");
};
