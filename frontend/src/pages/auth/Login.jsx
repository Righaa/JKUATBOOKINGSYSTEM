import { useState, useContext, useEffect } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getDashboardPath } from "../../utils/authUtils";
import PasswordField from "../../components/common/PasswordField";

export default function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      const authUser = login(res.data.token);

      toast.success("Successfully logged in");
      navigate(getDashboardPath(authUser.role), { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-page">
      <form onSubmit={handleLogin} className="auth-form-card">
        <h2 className="auth-form-title">JKUAT Hospital Login</h2>
        <p className="auth-form-subtitle">
          Sign in to book and manage appointments
        </p>

        <label className="auth-label" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          className="auth-input"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          variant="auth"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="auth-link-row">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </p>

        <p className="auth-link-row">
          <Link to="/doctor/login" className="auth-link">
            Doctor portal login
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
