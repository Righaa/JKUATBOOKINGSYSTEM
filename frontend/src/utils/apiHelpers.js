// Simple helpers to match backend field names with what the UI expects

export function mapDoctor(doctor) {
  return {
    id: doctor.doctorId,
    name: doctor.fullName,
    email: doctor.email,
    specialty: doctor.specialty || doctor.specialization || "General Doctor",
    specialization: doctor.specialty || doctor.specialization || "General Doctor",
    phone: doctor.phone || doctor.phoneNumber || "",
  };
}

export function mapAppointment(appointment) {
  return {
    id: appointment.id ?? appointment.appointmentId ?? appointment.Id,
    patientId: appointment.patientId,
    doctorName: appointment.doctorName,
    doctorSpecialty: appointment.doctorSpecialty || "",
    patientName: appointment.patientName,
    appointmentDate: appointment.appointmentDate,
    status: appointment.status,
    reason: appointment.reason || "",
  };
}

export function mapDoctorForApi(data) {
  const specialty = data.specialty || data.specialization || "General Doctor";
  return {
    fullName: data.name || data.fullName,
    email: data.email,
    specialty,
    phoneNumber: data.phone || data.phoneNumber || "",
  };
}
