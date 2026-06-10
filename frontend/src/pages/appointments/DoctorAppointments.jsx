import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDoctorAppointments,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
} from "../../services/AppointmentService";
import RejectAppointmentModal from "../../components/appointments/RejectAppointmentModal";
import connection from "../../realtime/SignalR";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

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

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    connection.on("AppointmentCreated", fetchAppointments);
    connection.on("AppointmentApproved", fetchAppointments);
    connection.on("AppointmentRejected", fetchAppointments);
    connection.on("AppointmentCancelled", fetchAppointments);
    connection.on("AppointmentCompleted", fetchAppointments);

    return () => {
      connection.off("AppointmentCreated");
      connection.off("AppointmentApproved");
      connection.off("AppointmentRejected");
      connection.off("AppointmentCancelled");
      connection.off("AppointmentCompleted");
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      toast.success("Appointment approved");
      fetchAppointments();
    } catch (err) {
      toast.error(getErrorMessage(err, "Approval failed"));
    }
  };

  const openRejectModal = (appointment) => setRejectTarget(appointment);

  const closeRejectModal = () => {
    if (!rejecting) setRejectTarget(null);
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;

    setRejecting(true);
    try {
      await rejectAppointment(rejectTarget.id, reason);
      setAppointments((prev) => prev.filter((a) => a.id !== rejectTarget.id));
      toast.success("Appointment rejected");
      setRejectTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Rejection failed"));
    } finally {
      setRejecting(false);
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

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this appointment as completed?")) return;

    try {
      await completeAppointment(id);
      toast.success("Appointment marked as completed");
      fetchAppointments();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not complete appointment"));
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
      case "Cancelled":
        return "admin-status admin-status-rejected";
      default:
        return "admin-status admin-status-pending";
    }
  };

  const canCancel = (status) => status === "Pending" || status === "Approved";

  if (loading) {
    return (
      <div className="dashboard-card admin-empty-state">
        <p>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <RejectAppointmentModal
        isOpen={Boolean(rejectTarget)}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
        submitting={rejecting}
        appointmentLabel={
          rejectTarget ? `${rejectTarget.patientName}'s appointment request` : ""
        }
      />

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

              <div className="admin-form-actions admin-form-actions-split">
                {app.patientId && (
                  <Link to={`/doctor/patients/${app.patientId}`} className="btn-sky">
                    View patient records
                  </Link>
                )}

                {app.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => openRejectModal(app)}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(app.id)}
                      className="btn-success"
                    >
                      Approve
                    </button>
                  </>
                )}

                {app.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => handleComplete(app.id)}
                    className="btn-sky"
                  >
                    Mark completed
                  </button>
                )}

                {canCancel(app.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(app.id)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
