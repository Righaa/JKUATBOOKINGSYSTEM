// src/routes/AppRoutes.jsx

import { Routes, Route } from "react-router-dom";

// Layout
import DashboardLayout from "../layouts/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

// Public Pages
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import DoctorLogin from "../pages/auth/DoctorLogin";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// Dashboards
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import DoctorDashboard from "../pages/dashboard/DoctorDashboard";
import PatientDashboard from "../pages/dashboard/PatientDashboard";

// Doctors
import Doctors from "../pages/doctors/Doctors";
import DoctorPatients from "../pages/doctors/DoctorPatients";
import DoctorPatientDetail from "../pages/doctors/DoctorPatientDetail";

// Appointments
import BookAppointment from "../pages/appointments/BookAppointment";
import AppointmentCalendar from "../pages/appointments/AppointmentCalendar";
import AdminAppointments from "../pages/appointments/AdminAppointments";
import DoctorAppointments from "../pages/appointments/DoctorAppointments";

// Doctor Profile
import DoctorProfile from "../pages/profile/DoctorProfile";
import AdminProfile from "../pages/profile/AdminProfile";

// Patient Profile
import PatientProfile from "../pages/profile/PatientProfile";
import PatientAppointments from "../pages/profile/PatientAppointments";

export default function AppRoutes() {
  return (
    <Routes>

      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ADMIN ROUTES */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/doctors"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <DashboardLayout>
              <Doctors />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/appointments"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <DashboardLayout>
              <AdminAppointments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute roles={["Admin"]}>
            <DashboardLayout>
              <AdminProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* DOCTOR ROUTES */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <DoctorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/appointments"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <DoctorAppointments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/calendar"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <AppointmentCalendar />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <DoctorPatients />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/patients/:patientId"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <DoctorPatientDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/profile"
        element={
          <ProtectedRoute roles={["Doctor"]}>
            <DashboardLayout>
              <DoctorProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* PATIENT ROUTES */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={["Patient"]}>
            <DashboardLayout>
              <PatientDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/book-appointment"
        element={
          <ProtectedRoute roles={["Patient"]}>
            <DashboardLayout>
              <BookAppointment />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/profile"
        element={
          <ProtectedRoute roles={["Patient"]}>
            <DashboardLayout>
              <PatientProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/history"
        element={
          <ProtectedRoute roles={["Patient"]}>
            <DashboardLayout>
              <PatientAppointments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* NOT FOUND */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}