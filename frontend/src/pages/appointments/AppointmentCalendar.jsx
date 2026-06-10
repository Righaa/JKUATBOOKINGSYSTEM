import { useEffect, useState } from "react";
import { getAppointmentsByMonth } from "../../services/CalendarService";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { toast } from "react-toastify";
import { formatDoctorName } from "../../utils/formatDoctorName";
import { getErrorMessage } from "../../utils/getErrorMessage";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await getAppointmentsByMonth(month, year);
      setAppointments(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load calendar"));
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const monthStartDay = startOfMonth(currentDate).getDay();
  const paddingDays = Array.from({ length: monthStartDay }, (_, i) => i);

  const getAppointmentsForDay = (date) =>
    appointments.filter(
      (app) =>
        format(new Date(app.appointmentDate), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  return (
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

      <div className="calendar-grid calendar-grid-expanded">
        {paddingDays.map((pad) => (
          <div key={`pad-${pad}`} className="calendar-cell calendar-cell-empty" />
        ))}
        {daysInMonth.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);

          return (
            <div
              key={day.toISOString()}
              className={`calendar-cell calendar-cell-expanded ${
                isToday(day) ? "calendar-cell-today" : ""
              }`}
            >
              <span className="calendar-day-num">{format(day, "d")}</span>

              <div className="calendar-day-events">
                {dayAppointments.slice(0, 3).map((app) => (
                  <div
                    key={app.id}
                    className="calendar-event-chip"
                    title={`${format(new Date(app.appointmentDate), "h:mm a")} — ${app.patientName} with ${formatDoctorName(app.doctorName)}`}
                  >
                    <span className="calendar-event-time">
                      {format(new Date(app.appointmentDate), "h:mm a")}
                    </span>
                    <span className="calendar-event-doctor">
                      {formatDoctorName(app.doctorName)}
                    </span>
                    <span className="calendar-event-patient">
                      {app.patientName}
                    </span>
                  </div>
                ))}

                {dayAppointments.length > 3 && (
                  <span className="calendar-event-more">
                    +{dayAppointments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

