import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const linkClass = (path) =>
    location.pathname === path ? "sidebar-link sidebar-link-active" : "sidebar-link";

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-header">
        <h1>JKUAT Hospital</h1>
        <p>Appointment Booking System</p>
      </div>

      <nav className="dashboard-nav">
        {user?.role === "Admin" && (
          <>
            <Link to="/admin/dashboard" className={linkClass("/admin/dashboard")}>
              Dashboard
            </Link>
            <Link to="/admin/doctors" className={linkClass("/admin/doctors")}>
              Doctors Management
            </Link>
            <Link to="/admin/appointments" className={linkClass("/admin/appointments")}>
              Appointment Approvals
            </Link>
          </>
        )}

        {user?.role === "Doctor" && (
          <>
            <Link to="/doctor/dashboard" className={linkClass("/doctor/dashboard")}>
              Dashboard
            </Link>
            <Link to="/doctor/appointments" className={linkClass("/doctor/appointments")}>
              My Appointments
            </Link>
            <Link to="/doctor/patients" className={linkClass("/doctor/patients")}>
              My Patients
            </Link>
            <Link to="/doctor/calendar" className={linkClass("/doctor/calendar")}>
              Appointment Calendar
            </Link>
          </>
        )}

        {user?.role === "Patient" && (
          <>
            <Link to="/patient/dashboard" className={linkClass("/patient/dashboard")}>
              Dashboard
            </Link>
            <Link to="/patient/profile" className={linkClass("/patient/profile")}>
              My Profile
            </Link>
            <Link to="/patient/book-appointment" className={linkClass("/patient/book-appointment")}>
              Book Appointment
            </Link>
            <Link to="/patient/history" className={linkClass("/patient/history")}>
              Medical History
            </Link>
          </>
        )}
      </nav>

      <div className="dashboard-sidebar-footer">
        <div className="dashboard-user-block">
          <p className="dashboard-user-email">{user?.email}</p>
          {user?.role === "Doctor" && user?.doctorId && (
            <p className="dashboard-user-meta">Doctor ID: {user.doctorId}</p>
          )}
          <span className="dashboard-role-badge">{user?.role}</span>
        </div>
      </div>
    </aside>
  );
}
