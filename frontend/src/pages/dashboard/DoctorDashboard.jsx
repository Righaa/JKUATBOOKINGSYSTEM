import { useContext, useEffect, useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { getDoctorAppointments } from "../../services/AppointmentService";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorDashboard() {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState("");

  const notesKey = user?.id ? `doctor-notes-${user.id}` : "doctor-notes";

  useEffect(() => {
    fetchAppointments();
    const saved = localStorage.getItem(notesKey);
    if (saved) setNotes(saved);
  }, [notesKey]);

  const fetchAppointments = async () => {
    try {
      const res = await getDoctorAppointments();
      setAppointments(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load appointments"));
    }
  };

  const saveNotes = () => {
    localStorage.setItem(notesKey, notes);
    toast.success("Notes saved");
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const monthStartDay = startOfMonth(currentDate).getDay();
  const paddingDays = Array.from({ length: monthStartDay }, (_, i) => i);

  const getAppointmentsForDay = (date) =>
    appointments.filter((app) =>
      isSameDay(new Date(app.appointmentDate), date)
    );

  const upcomingAlerts = useMemo(() => {
    const now = new Date();
    return appointments
      .filter((a) => new Date(a.appointmentDate) >= now && a.status !== "Cancelled")
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);
  }, [appointments]);

  const changeMonth = (offset) => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(next);
  };

  return (
    <div className="dashboard-stack">
      <div className="dashboard-grid-2">
        <div className="dashboard-card">
          <div className="calendar-toolbar">
            <button type="button" className="btn-secondary" onClick={() => changeMonth(-1)}>
              Prev
            </button>
            <h2 className="calendar-month-label">{format(currentDate, "MMMM yyyy")}</h2>
            <button type="button" className="btn-secondary" onClick={() => changeMonth(1)}>
              Next
            </button>
          </div>

          <div className="calendar-weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {paddingDays.map((pad) => (
              <div key={`pad-${pad}`} className="calendar-cell calendar-cell-empty" />
            ))}
            {daysInMonth.map((day) => {
              const dayApps = getAppointmentsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-cell ${isToday(day) ? "calendar-cell-today" : ""}`}
                >
                  <span className="calendar-day-num">{format(day, "d")}</span>
                  {dayApps.length > 0 && (
                    <span className="calendar-dot" title={`${dayApps.length} appointment(s)`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-stack">
          <div className="dashboard-card">
            <h2 className="section-title">Appointment Alerts</h2>
            {upcomingAlerts.length === 0 ? (
              <p className="text-muted">No upcoming appointments.</p>
            ) : (
              <div className="list-stack">
                {upcomingAlerts.map((app) => (
                  <div key={app.id} className="alert-row">
                    <div>
                      <p className="font-semibold">{app.patientName}</p>
                      <p className="text-sm text-muted">
                        {new Date(app.appointmentDate).toLocaleString()}
                      </p>
                    </div>
                    <span className="specialty-badge">{app.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card">
            <h2 className="section-title">Quick Notes</h2>
            <textarea
              className="auth-input notes-area"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal notes for today..."
            />
            <button type="button" className="btn-primary mt-3" onClick={saveNotes}>
              Save Notes
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="section-title">This Month&apos;s Schedule</h2>
        <div className="list-stack">
          {appointments
            .filter((a) => {
              const d = new Date(a.appointmentDate);
              return (
                d.getMonth() === currentDate.getMonth() &&
                d.getFullYear() === currentDate.getFullYear()
              );
            })
            .slice(0, 8)
            .map((app) => (
              <div key={app.id} className="list-row">
                <div>
                  <p className="font-semibold">{app.patientName}</p>
                  <p className="text-sm text-muted">{app.reason || "No reason provided"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{new Date(app.appointmentDate).toLocaleString()}</p>
                  <span className="specialty-badge">{app.status}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
