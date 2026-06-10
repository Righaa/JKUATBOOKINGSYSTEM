import { useEffect, useState } from "react";
import { getPatientAppointments } from "../../services/PatientService";
import { cancelAppointment } from "../../services/AppointmentService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";
import PageInfoBanner from "../../components/common/PageInfoBanner";
import SectionHeader from "../../components/common/SectionHeader";

function statusBadgeClass(status) {
  switch (status) {
    case "Approved":
      return "status-badge status-badge-approved";
    case "Rejected":
      return "status-badge status-badge-rejected";
    case "Cancelled":
      return "status-badge status-badge-cancelled";
    default:
      return "status-badge status-badge-pending";
  }
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getPatientAppointments();
      setAppointments(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load appointments"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    try {
      await cancelAppointment(id);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not cancel appointment"));
    }
  };

  const canCancel = (status) => status === "Pending" || status === "Approved";

  if (loading) {
    return (
      <div className="dashboard-card profile-page">
        <p className="text-muted">Loading medical history...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card profile-page">
      <PageInfoBanner>
        View your past and upcoming appointments with doctors at JKUAT Hospital.
      </PageInfoBanner>

      {appointments.length === 0 ? (
        <p className="text-muted">No appointments found.</p>
      ) : (
        appointments.map((app, index) => (
          <section key={app.id} className="history-record-card">
            <SectionHeader className="page-section-header-compact">
              Appointment {index + 1} — {formatDoctorName(app.doctorName)}
            </SectionHeader>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label className="auth-label">Doctor</label>
                <input
                  className="auth-input profile-input profile-input-readonly"
                  readOnly
                  value={formatDoctorName(app.doctorName)}
                />
              </div>

              <div className="profile-field">
                <label className="auth-label">Specialty</label>
                <input
                  className="auth-input profile-input profile-input-readonly"
                  readOnly
                  value={app.doctorSpecialty || "General Doctor"}
                />
              </div>

              <div className="profile-field">
                <label className="auth-label">Date &amp; time</label>
                <input
                  className="auth-input profile-input profile-input-readonly"
                  readOnly
                  value={new Date(app.appointmentDate).toLocaleString()}
                />
              </div>

              <div className="profile-field">
                <label className="auth-label">Status</label>
                <div>
                  <span className={statusBadgeClass(app.status)}>{app.status}</span>
                </div>
              </div>

              <div className="profile-field profile-field-full">
                <label className="auth-label">Reason</label>
                <textarea
                  className="auth-input profile-input profile-input-readonly"
                  readOnly
                  rows={2}
                  value={app.reason || "No reason provided"}
                />
              </div>

              {app.status === "Rejected" && app.rejectionReason && (
                <div className="profile-field profile-field-full">
                  <label className="auth-label">Rejection reason</label>
                  <textarea
                    className="auth-input profile-input profile-input-readonly"
                    readOnly
                    rows={2}
                    value={app.rejectionReason}
                  />
                </div>
              )}
            </div>

            {canCancel(app.status) && (
              <div className="profile-actions profile-password-actions">
                <button
                  type="button"
                  onClick={() => handleCancel(app.id)}
                  className="btn-danger"
                >
                  Cancel Appointment
                </button>
              </div>
            )}
          </section>
        ))
      )}
    </div>
  );
}
