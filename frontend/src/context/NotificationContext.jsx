import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getNotifications, markAsRead, deleteNotification } from "../services/NotificationService";
import { AuthContext } from "./AuthContext";
import connection from "../realtime/SignalR";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch {
      // Keep polling quietly if notifications are unavailable
    }
  }, [user]);

  const markNotificationRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // Ignore mark-read failures silently
    }
  }, []);

  const removeNotification = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // Ignore delete failures silently
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    const refresh = () => fetchNotifications();

    connection.on("ReceiveNotification", refresh);
    connection.on("AppointmentCreated", refresh);
    connection.on("AppointmentApproved", refresh);
    connection.on("AppointmentRejected", refresh);
    connection.on("AppointmentCancelled", refresh);
    connection.on("AppointmentCompleted", refresh);
    connection.on("MedicalRecordCreated", refresh);
    connection.on("AppointmentReminder", refresh);

    return () => {
      clearInterval(interval);
      connection.off("ReceiveNotification", refresh);
      connection.off("AppointmentCreated", refresh);
      connection.off("AppointmentApproved", refresh);
      connection.off("AppointmentRejected", refresh);
      connection.off("AppointmentCancelled", refresh);
      connection.off("AppointmentCompleted", refresh);
      connection.off("MedicalRecordCreated", refresh);
      connection.off("AppointmentReminder", refresh);
    };
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, fetchNotifications, markNotificationRead, removeNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
