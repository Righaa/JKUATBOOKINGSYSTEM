import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/common/NotificationBell";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    const loginPath = user?.role === "Doctor" ? "/doctor/login" : "/login";
    logout();
    navigate(loginPath);
  };

  return (
    <header className="dashboard-navbar">
      <span className="navbar-brand">JKUAT Hospital</span>

      <div className="navbar-actions">
        <NotificationBell />
        <button type="button" onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </header>
  );
}
