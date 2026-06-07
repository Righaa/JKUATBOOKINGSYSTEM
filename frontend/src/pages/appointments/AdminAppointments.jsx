import { useEffect, useState } from "react";
import {
  getAppointments,
  approveAppointment,
  rejectAppointment,
} from "../../services/AppointmentService";
import connection from "../../realtime/SignalR";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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

    return () => {
      connection.off("AppointmentCreated");
      connection.off("AppointmentApproved");
      connection.off("AppointmentRejected");
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveAppointment(id);
      toast.success("Appointment approved");
      await connection.invoke("SendAppointmentApproved", { appointmentId: id });
      fetchAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Approval failed"));
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectAppointment(id);
      toast.success("Appointment rejected");
      await connection.invoke("SendAppointmentRejected", { appointmentId: id });
      fetchAppointments();
    } catch (error) {
      toast.error(getErrorMessage(error, "Rejection failed"));
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

              {appointment.status === "Pending" && (
                <div className="admin-form-actions admin-form-actions-split">
                  <button
                    type="button"
                    onClick={() => handleReject(appointment.id)}
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
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
