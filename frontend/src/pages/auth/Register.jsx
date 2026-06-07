import { useState, useContext, useEffect } from "react";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { getDashboardPath } from "../../utils/authUtils";
import PasswordField from "../../components/common/PasswordField";

export default function Register() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/auth/register", { name, email, password });
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(getErrorMessage(err, "Registration failed. Email may already be in use."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-auth-page">
      <form onSubmit={handleRegister} className="auth-form-card">
        <h2 className="auth-form-title">Create Account</h2>
        <p className="auth-form-subtitle">
          Register as a patient to book hospital appointments
        </p>

        <label className="auth-label" htmlFor="register-name">
          Full name
        </label>
        <input
          id="register-name"
          type="text"
          required
          value={name}
          className="auth-input"
          placeholder="John Doe"
          onChange={(e) => setName(e.target.value)}
        />

        <label className="auth-label" htmlFor="register-email">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          value={email}
          className="auth-input"
          placeholder="you@example.com"
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          id="register-password"
          label="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          showPassword={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          variant="auth"
          autoComplete="new-password"
          required
          minLength={6}
        />

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="auth-link-row">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
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
