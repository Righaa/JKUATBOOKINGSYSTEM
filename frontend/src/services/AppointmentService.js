import API from "../api/axios";
import { mapDoctor, mapAppointment } from "../utils/apiHelpers";

export const getDoctors = async (specialty) => {
  const params = specialty ? { specialty } : {};
  const res = await API.get("/doctors", { params });
  return { ...res, data: res.data.map(mapDoctor) };
};

export const createAppointment = async (data) => {
  return await API.post("/appointments", {
    doctorId: Number(data.doctorId),
    appointmentDate: data.appointmentDate,
    reason: data.reason || "",
  });
};

export const getAppointments = async () => {
  const res = await API.get("/appointments");
  return { ...res, data: res.data.map(mapAppointment) };
};

export const getDoctorAppointments = async () => {
  const res = await API.get("/appointments/doctor");
  return { ...res, data: res.data.map(mapAppointment) };
};

export const approveAppointment = async (id) => {
  return await API.put(`/appointments/${id}/approve`);
};

export const rejectAppointment = async (id) => {
  return await API.put(`/appointments/${id}/reject`);
};

export const cancelAppointment = async (id) => {
  return await API.put(`/appointments/${id}/cancel`);
};
