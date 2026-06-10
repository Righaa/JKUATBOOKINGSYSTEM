import { useContext, useEffect, useRef, useState } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import { sanitizeNotificationMessage } from "../../utils/formatDoctorName";
import {
  getNotificationMeta,
  formatNotificationTime,
} from "../../utils/notificationUtils";

function NotificationIcon({ type }) {
  const icons = {
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    x: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    cancel: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
      </svg>
    ),
    medical: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 6v12M6 12h12" strokeLinecap="round" />
        <rect x="4" y="3" width="16" height="18" rx="2" />
      </svg>
    ),
    doctor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 21v-1a6 6 0 0112 0v1" strokeLinecap="round" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" strokeLinecap="round" />
        <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
      </svg>
    ),
  };

  return icons[type] || icons.bell;
}

export default function NotificationBell() {
  const { notifications, markNotificationRead, removeNotification } =
    useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const panelRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id);
    }
  };

  const handleDelete = async (event, id) => {
    event.stopPropagation();
    await removeNotification(id);
  };

  return (
    <div className="notification-bell-wrap" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="notification-bell-btn"
        aria-label="Notifications"
      >
        <svg
          className="notification-bell-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="notification-panel-count">{unreadCount} new</span>
            )}
          </div>

          <div className="notification-panel-body">
            {notifications.length === 0 ? (
              <p className="notification-empty">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const meta = getNotificationMeta(n.message);
                const time = formatNotificationTime(n.createdAt, now);

                return (
                  <div
                    key={n.id}
                    className={`notification-item notification-item-${meta.type} ${
                      n.read ? "notification-item-read" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="notification-item-main"
                      onClick={() => handleItemClick(n)}
                    >
                      <span className={`notification-item-icon notification-icon-${meta.type}`}>
                        <NotificationIcon type={meta.icon} />
                      </span>
                      <span className="notification-item-content">
                        <span className="notification-item-label">{meta.label}</span>
                        <span className="notification-item-message">
                          {sanitizeNotificationMessage(n.message)}
                        </span>
                        {time && <span className="notification-item-time">{time}</span>}
                      </span>
                      {!n.read && <span className="notification-unread-dot" />}
                    </button>
                    <button
                      type="button"
                      className="notification-dismiss-btn"
                      onClick={(event) => handleDelete(event, n.id)}
                      aria-label="Dismiss notification"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
