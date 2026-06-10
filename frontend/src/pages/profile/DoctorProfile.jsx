import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { changeDoctorPassword } from "../../services/DoctorPortalService";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { isValidPassword } from "../../utils/passwordValidation";
import PasswordField from "../../components/common/PasswordField";
import PageInfoBanner from "../../components/common/PageInfoBanner";

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function DoctorProfile() {
  const { user } = useContext(AuthContext);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.error("Please fill in all password fields");
    }

    if (!isValidPassword(newPassword)) {
      return toast.error("Password does not meet security requirements");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New passwords do not match");
    }

    setChangingPassword(true);
    try {
      await changeDoctorPassword({ currentPassword, newPassword });
      toast.success("Password updated successfully");
      setPasswordForm(emptyPasswordForm);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Password update failed"));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="dashboard-card profile-page">
      <PageInfoBanner>
        Update your doctor portal password. Use a strong password you have not used elsewhere.
      </PageInfoBanner>

      <section className="profile-section">
        <h2 className="profile-section-title">Account</h2>
        <dl className="admin-detail-grid">
          <div className="admin-detail-item">
            <dt>Doctor ID</dt>
            <dd>{user?.doctorId ?? "—"}</dd>
          </div>
          <div className="admin-detail-item">
            <dt>Email</dt>
            <dd>{user?.email ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="profile-section">
        <h2 className="profile-section-title">Change Password</h2>

        <form onSubmit={handleSubmit}>
          <div className="profile-form-grid">
            <div className="profile-field profile-field-full">
              <PasswordField
                id="doctor-current-password"
                label="Current password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                showPassword={showCurrentPassword}
                onToggleShow={() => setShowCurrentPassword((v) => !v)}
              />
            </div>

            <div className="profile-field">
              <PasswordField
                id="doctor-new-password"
                label="New password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                showPassword={showNewPassword}
                onToggleShow={() => setShowNewPassword((v) => !v)}
              />
            </div>

            <div className="profile-field">
              <PasswordField
                id="doctor-confirm-password"
                label="Confirm new password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                showPassword={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword((v) => !v)}
              />
            </div>
          </div>

          <div className="profile-actions profile-password-actions">
            <button type="submit" disabled={changingPassword} className="btn-hospital">
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
