import { createContext, useEffect } from "react";
import connection from "../realtime/SignalR";

export const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {

  useEffect(() => {

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected");
      } catch (err) {
        console.log("Connection error", err);
      }
    };

    startConnection();

    connection.on("AppointmentCreated", () => {});
    connection.on("AppointmentApproved", () => {});
    connection.on("AppointmentRejected", () => {});
    connection.on("AppointmentCancelled", () => {});
    connection.on("MedicalRecordCreated", () => {});

    return () => {
      connection.stop();
    };

  }, []);

  return children;
};