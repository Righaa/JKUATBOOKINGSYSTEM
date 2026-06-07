const PAGE_TITLES = {
  "/admin/dashboard": "Admin Dashboard",
  "/admin/doctors": "Doctors Management",
  "/admin/appointments": "Appointment Approvals",
  "/doctor/dashboard": "Doctor Dashboard",
  "/doctor/appointments": "My Appointments",
  "/doctor/patients": "My Patients",
  "/doctor/calendar": "Appointment Calendar",
  "/patient/dashboard": "Patient Dashboard",
  "/patient/profile": "My Profile",
  "/patient/book-appointment": "Book Appointment",
  "/patient/history": "Medical History",
};

export function getPageTitle(pathname) {
  if (pathname.startsWith("/doctor/patients/") && pathname !== "/doctor/patients") {
    return "Patient Medical Records";
  }
  return PAGE_TITLES[pathname] ?? "Dashboard";
}
