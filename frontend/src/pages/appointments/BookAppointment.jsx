import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctors, createAppointment } from "../../services/AppointmentService";
import { getPatientProfile } from "../../services/PatientService";
import { DOCTOR_SPECIALTIES } from "../../constants/doctorSpecialties";
import { isPatientProfileComplete } from "../../utils/patientProfileUtils";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";
import BookingDatePicker from "../../components/appointments/BookingDatePicker";
import PageInfoBanner from "../../components/common/PageInfoBanner";
import SectionHeader from "../../components/common/SectionHeader";
import { toast } from "react-toastify";

export default function BookAppointment() {
  const [specialty, setSpecialty] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profileLoading && isPatientProfileComplete(profile)) {
      fetchDoctors();
    }
  }, [specialty, profile, profileLoading]);

  const fetchProfile = async () => {
    setProfileLoading(true);

    try {
      const res = await getPatientProfile();
      setProfile(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load your profile"));
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await getDoctors(specialty || undefined);
      setDoctors(res.data);
      setForm((prev) => ({ ...prev, doctorId: "" }));
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load doctors"));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (appointmentDate) => {
    setForm((prev) => ({ ...prev, appointmentDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPatientProfileComplete(profile)) {
      return toast.error("Complete your profile before booking an appointment");
    }

    if (!form.doctorId || !form.appointmentDate) {
      return toast.error("Please select a doctor, date, and time");
    }

    try {
      setLoading(true);
      await createAppointment(form);
      toast.success("Appointment booked successfully");
      setForm({ doctorId: "", appointmentDate: "", reason: "" });
    } catch (err) {
      toast.error(getErrorMessage(err, "Booking failed"));
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="dashboard-card profile-page">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!isPatientProfileComplete(profile)) {
    return (
      <div className="dashboard-card profile-page">
        <SectionHeader>Complete Your Profile First</SectionHeader>
        <PageInfoBanner>
          Before booking an appointment, patients must provide their name, phone
          number, and age on the profile page.
        </PageInfoBanner>
        <Link to="/patient/profile" className="btn-sky">
          Go to My Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-card profile-page">
      <PageInfoBanner>
        Booking as {profile.name} · {profile.phone} · Age {profile.age}
      </PageInfoBanner>

      <form onSubmit={handleSubmit} className="booking-form">
        <SectionHeader>Specialty</SectionHeader>
        <div className="profile-field">
          <select
            id="booking-specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="auth-input profile-input"
          >
            <option value="">All specialties</option>
            {DOCTOR_SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <SectionHeader>Doctor</SectionHeader>
        <div className="profile-field">
          <select
            id="booking-doctor"
            name="doctorId"
            value={form.doctorId}
            onChange={handleChange}
            className="auth-input profile-input"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {formatDoctorName(doc.name)} — {doc.specialty}
              </option>
            ))}
          </select>
        </div>

        <SectionHeader>Appointment Date &amp; Time</SectionHeader>
        <div className="profile-field">
          <BookingDatePicker
            value={form.appointmentDate}
            onChange={handleDateChange}
          />
        </div>

        <SectionHeader>Reason for Visit</SectionHeader>
        <div className="profile-field">
          <textarea
            id="booking-reason"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="Describe your symptoms or reason for the visit"
            className="auth-input profile-input"
            rows={3}
          />
        </div>

        <div className="profile-actions profile-password-actions">
          <button type="submit" disabled={loading} className="btn-sky">
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}
