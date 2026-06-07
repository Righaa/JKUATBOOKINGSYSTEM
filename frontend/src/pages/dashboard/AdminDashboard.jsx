import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getRecentAppointments,
} from "../../services/DashboardService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecent();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load dashboard stats"));
    }
  };

  const fetchRecent = async () => {
    try {
      const res = await getRecentAppointments();
      setRecent(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load recent appointments"));
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

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="dashboard-card">
          <span className="stat-card-label">Total Patients</span>
          <p className="text-2xl font-bold">{stats?.patients ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <span className="stat-card-label">Total Doctors</span>
          <p className="text-2xl font-bold">{stats?.doctors ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <span className="stat-card-label">Appointments</span>
          <p className="text-2xl font-bold">{stats?.appointments ?? 0}</p>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="section-title">Recent Appointments</h2>

        {recent.length === 0 ? (
          <p className="admin-empty-state">No recent appointments</p>
        ) : (
          <div className="recent-appt-list">
            <div className="recent-appt-header">
              <span>Doctor</span>
              <span>Patient</span>
              <span>Date &amp; time</span>
              <span>Status</span>
            </div>

            {recent.map((app) => (
              <article key={app.id} className="recent-appt-row">
                <p className="recent-appt-doctor">{formatDoctorName(app.doctorName)}</p>
                <p className="recent-appt-patient">{app.patientName}</p>
                <time className="recent-appt-date">
                  {new Date(app.appointmentDate).toLocaleString()}
                </time>
                <span className={getStatusClass(app.status)}>{app.status}</span>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
