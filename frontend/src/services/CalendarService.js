import API from "../api/axios";
import { mapAppointment } from "../utils/apiHelpers";

export const getAppointmentsByMonth = async (month, year) => {
  const res = await API.get(`/appointments/calendar?month=${month}&year=${year}`);
  return { ...res, data: res.data.map(mapAppointment) };
};
