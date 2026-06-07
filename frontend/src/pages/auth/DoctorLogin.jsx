import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { doctorLogin } from "../../services/DoctorPortalService";
import { getDashboardPath } from "../../utils/authUtils";
import PasswordField from "../../components/common/PasswordField";

export default function DoctorLogin() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "Doctor") {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await doctorLogin(doctorId, password);
      const authUser = login(res.data.token);
      toast.success("Successfully logged in");
      navigate(getDashboardPath(authUser.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid doctor ID or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-page">
      <form onSubmit={handleLogin} className="auth-form-card">
        <h2 className="auth-form-title">Doctor Portal</h2>
        <p className="auth-form-subtitle">
          Sign in with your Doctor ID and password
        </p>

        <label className="auth-label" htmlFor="doctor-id">
          Doctor ID
        </label>
        <input
          id="doctor-id"
          type="number"
          min="1"
          required
          value={doctorId}
          className="auth-input"
          placeholder="e.g. 1"
          onChange={(e) => setDoctorId(e.target.value)}
        />

        <PasswordField
          id="doctor-password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Default: Doctor@123"
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          variant="auth"
          autoComplete="current-password"
          required
        />

        <p className="text-xs text-gray-500 mb-3">
          First-time login uses the default password provided by admin.
        </p>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Signing in..." : "Doctor Login"}
        </button>

        <p className="auth-link-row">
          <Link to="/login" className="auth-link-muted">
            Patient / Admin login
          </Link>
        </p>

        <p className="auth-link-row">
          <Link to="/" className="auth-link-muted">
            Back to home
          </Link>
        </p>
      </form>
    </div>
  );
}
