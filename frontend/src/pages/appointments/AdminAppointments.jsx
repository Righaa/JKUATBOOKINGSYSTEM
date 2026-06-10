import { useEffect, useState } from "react";
import {
  getAppointments,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
} from "../../services/AppointmentService";
import RejectAppointmentModal from "../../components/appointments/RejectAppointmentModal";
import connection from "../../realtime/SignalR";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load appointments"));
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Approval failed"));
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Rejection failed"));
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
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not cancel appointment"));
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Mark this appointment as completed?")) return;

    try {
      await completeAppointment(id);
      toast.success("Appointment marked as completed");
      fetchAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not complete appointment"));
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
          rejectTarget
            ? `${rejectTarget.patientName}'s request with ${formatDoctorName(rejectTarget.doctorName)}`
            : ""
        }
      />

      {appointments.length === 0 ? (
        <div className="dashboard-card admin-empty-state">
          <p>No appointments available</p>
        </div>
      ) : (
        <div className="admin-record-list">
          {appointments.map((appointment) => (
            <article key={appointment.id} className="dashboard-card admin-record-card">
              <div className="admin-record-header">
                <div>
                  <h3 className="admin-record-title">
                    {formatDoctorName(appointment.doctorName)}
                  </h3>
                  <p className="admin-record-subtitle">Appointment #{appointment.id}</p>
                </div>
                <span className={getStatusClass(appointment.status)}>
                  {appointment.status}
                </span>
              </div>

              <dl className="admin-detail-grid">
                <div className="admin-detail-item">
                  <dt>Patient</dt>
                  <dd>{appointment.patientName}</dd>
                </div>
                <div className="admin-detail-item">
                  <dt>Date &amp; time</dt>
                  <dd>{new Date(appointment.appointmentDate).toLocaleString()}</dd>
                </div>
                <div className="admin-detail-item admin-detail-item-full">
                  <dt>Reason for visit</dt>
                  <dd>{appointment.reason || "—"}</dd>
                </div>
              </dl>

              <div className="admin-form-actions admin-form-actions-split">
                {appointment.status === "Pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => openRejectModal(appointment)}
                      className="btn-danger"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(appointment.id)}
                      className="btn-success"
                    >
                      Approve
                    </button>
                  </>
                )}

                {appointment.status === "Approved" && (
                  <button
                    type="button"
                    onClick={() => handleComplete(appointment.id)}
                    className="btn-sky"
                  >
                    Mark completed
                  </button>
                )}

                {canCancel(appointment.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancel(appointment.id)}
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
