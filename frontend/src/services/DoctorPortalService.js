import API from "../api/axios";

export const getDoctorPatients = async () => {
  return await API.get("/doctor-portal/patients");
};

export const getDoctorPatient = async (patientId) => {
  return await API.get(`/doctor-portal/patients/${patientId}`);
};

export const getPatientMedicalRecords = async (patientId) => {
  return await API.get(`/doctor-portal/patients/${patientId}/records`);
};

export const createMedicalRecord = async (data) => {
  return await API.post("/doctor-portal/records", data);
};

export const updateMedicalRecord = async (id, data) => {
  return await API.put(`/doctor-portal/records/${id}`, data);
};

export const doctorLogin = async (doctorId, password) => {
  return await API.post("/auth/doctor-login", { doctorId: Number(doctorId), password });
};
