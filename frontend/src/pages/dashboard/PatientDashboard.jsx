import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getPatientAppointments, getPatientMedicalRecords } from "../../services/PatientService";
import { formatDoctorName } from "../../utils/formatDoctorName";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  Approved: "#16a34a",
  Rejected: "#dc2626",
  Cancelled: "#64748b",
};

const PIE_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#ea580c", "#16a34a", "#db2777"];

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, recordsRes] = await Promise.all([
        getPatientAppointments(),
        getPatientMedicalRecords(),
      ]);
      setAppointments(apptRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load dashboard data"));
    } finally {
      setLoading(false);
    }
  };

  const statusChartData = useMemo(() => {
    const counts = { Pending: 0, Approved: 0, Rejected: 0, Cancelled: 0 };
    appointments.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [appointments]);

  const recordsChartData = useMemo(() => {
    const byDiagnosis = {};
    records.forEach((r) => {
      const key = r.diagnosis?.trim() || "General";
      byDiagnosis[key] = (byDiagnosis[key] ?? 0) + 1;
    });
    return Object.entries(byDiagnosis).map(([name, value]) => ({ name, value }));
  }, [records]);

  if (loading) {
    return (
      <div className="dashboard-card">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <div className="dashboard-grid-2">
        <div className="dashboard-card chart-card">
          <h2 className="section-title">Appointment Statistics</h2>
          {appointments.length === 0 ? (
            <p className="text-muted">No appointments yet. Book one to see stats here.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusChartData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#2563eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dashboard-card chart-card">
          <h2 className="section-title">Medical Records Overview</h2>
          {records.length === 0 ? (
            <p className="text-muted">No medical records yet. Records appear after doctor visits.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={recordsChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {recordsChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="section-title">Recent Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-muted">No appointments scheduled.</p>
        ) : (
          <div className="list-stack">
            {appointments.slice(0, 5).map((app) => (
              <div key={app.id} className="list-row">
                <div>
                  <p className="font-semibold">{formatDoctorName(app.doctorName)}</p>
                  <p className="text-sm text-muted">{app.doctorSpecialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(app.appointmentDate).toLocaleString()}</p>
                  <span className="specialty-badge">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
