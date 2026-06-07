import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDoctorAppointments } from "../../services/AppointmentService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load appointments"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "admin-status admin-status-approved";
      case "Rejected":
        return "admin-status admin-status-rejected";
      case "Completed":
        return "admin-status admin-status-completed";
      default:
        return "admin-status admin-status-pending";
    }
  };

  if (loading) {
    return (
      <div className="dashboard-card admin-empty-state">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {appointments.length === 0 ? (
        <div className="dashboard-card admin-empty-state">
          <p>No appointments assigned yet.</p>
        </div>
      ) : (
        <div className="admin-record-list">
          {appointments.map((app) => (
            <article key={app.id} className="dashboard-card admin-record-card">
              <div className="admin-record-header">
                <div>
                  <h3 className="admin-record-title">{app.patientName}</h3>
                  <p className="admin-record-subtitle">Appointment #{app.id}</p>
                </div>
                <span className={getStatusClass(app.status)}>{app.status}</span>
              </div>

              <dl className="admin-detail-grid">
                <div className="admin-detail-item">
                  <dt>Date &amp; time</dt>
                  <dd>{new Date(app.appointmentDate).toLocaleString()}</dd>
                </div>
                <div className="admin-detail-item admin-detail-item-full">
                  <dt>Reason for visit</dt>
                  <dd>{app.reason || "—"}</dd>
                </div>
              </dl>

              {app.patientId && (
                <div className="admin-form-actions">
                  <Link
                    to={`/doctor/patients/${app.patientId}`}
                    className="btn-sky"
                  >
                    View patient records
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
