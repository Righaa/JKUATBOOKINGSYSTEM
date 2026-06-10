import { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function BookingDatePicker({ value, onChange }) {
  const selectedDate = value ? new Date(value) : null;
  const [viewDate, setViewDate] = useState(selectedDate || new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(viewDate),
    end: endOfMonth(viewDate),
  });

  const monthStartDay = startOfMonth(viewDate).getDay();
  const paddingDays = Array.from({ length: monthStartDay }, (_, i) => i);
  const today = startOfDay(new Date());

  const timeValue = useMemo(() => {
    if (!value) return "09:00";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "09:00";
    return format(date, "HH:mm");
  }, [value]);

  const changeMonth = (offset) => {
    const next = new Date(viewDate);
    next.setMonth(viewDate.getMonth() + offset);
    setViewDate(next);
  };

  const selectDay = (day) => {
    if (isBefore(day, today)) return;

    const [hours, minutes] = timeValue.split(":").map(Number);
    const next = new Date(day);
    next.setHours(hours || 9, minutes || 0, 0, 0);
    onChange(format(next, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    const base = selectedDate && !Number.isNaN(selectedDate.getTime())
      ? new Date(selectedDate)
      : new Date(today);

    if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
      const [hours, minutes] = time.split(":").map(Number);
      base.setHours(hours || 9, minutes || 0, 0, 0);
      if (isBefore(base, new Date())) {
        base.setTime(Date.now() + 60 * 60 * 1000);
      }
    } else {
      const [hours, minutes] = time.split(":").map(Number);
      base.setHours(hours || 0, minutes || 0, 0, 0);
    }

    onChange(format(base, "yyyy-MM-dd'T'HH:mm"));
  };

  return (
    <div className="booking-datetime-picker">
      <div className="calendar-toolbar">
        <button type="button" className="btn-secondary" onClick={() => changeMonth(-1)}>
          Prev
        </button>
        <h3 className="calendar-month-label booking-calendar-title">
          {format(viewDate, "MMMM yyyy")}
        </h3>
        <button type="button" className="btn-secondary" onClick={() => changeMonth(1)}>
          Next
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar-grid booking-calendar-grid">
        {paddingDays.map((pad) => (
          <div key={`pad-${pad}`} className="calendar-cell calendar-cell-empty" />
        ))}
        {daysInMonth.map((day) => {
          const isPast = isBefore(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => selectDay(day)}
              className={`calendar-cell booking-calendar-day ${
                isToday(day) ? "calendar-cell-today" : ""
              } ${isSelected ? "booking-calendar-day-selected" : ""} ${
                isPast ? "booking-calendar-day-past" : ""
              }`}
            >
              <span className="calendar-day-num">{format(day, "d")}</span>
            </button>
          );
        })}
      </div>

      <div className="booking-time-row">
        <label className="auth-label" htmlFor="booking-time">
          Appointment time
        </label>
        <input
          id="booking-time"
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="auth-input profile-input booking-time-input"
          required
        />
      </div>

      {value && (
        <p className="booking-selected-label">
          Selected: {format(new Date(value), "EEEE, MMMM d, yyyy 'at' h:mm a")}
        </p>
      )}
    </div>
  );
}
