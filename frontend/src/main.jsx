import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

// Toast notifications
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { RealtimeProvider } from "./context/RealtimeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>

      {/* AUTH (must be first for role access) */}
      <AuthProvider>

        {/* REAL-TIME SIGNALR (live updates) */}
          <RealtimeProvider>

            {/* NOTIFICATIONS (global system alerts) */}
            <NotificationProvider>

            {/* MAIN APP */}
            <App />

            {/* TOAST SYSTEM */}
            <ToastContainer
              position="top-right"
              autoClose={2500}
              hideProgressBar
              closeOnClick
              pauseOnHover={false}
              draggable={false}
              theme="colored"
              limit={1}
            />

            </NotificationProvider>

          </RealtimeProvider>

      </AuthProvider>

    </BrowserRouter>
  </React.StrictMode>
);