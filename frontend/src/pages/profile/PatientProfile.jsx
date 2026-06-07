import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {

  getPatientProfile,

  updatePatientProfile,

  changePatientPassword,

} from "../../services/PatientService";

import { isPatientProfileComplete } from "../../utils/patientProfileUtils";

import {

  isValidPassword,

  PASSWORD_RULES_HINT,

} from "../../utils/passwordValidation";

import PasswordField from "../../components/common/PasswordField";
import PageInfoBanner from "../../components/common/PageInfoBanner";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";



const emptyPasswordForm = {

  currentPassword: "",

  newPassword: "",

  confirmPassword: "",

};



export default function PatientProfile() {

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);



  useEffect(() => {

    fetchProfile();

  }, []);



  const fetchProfile = async () => {

    setLoading(true);

    setError(null);



    try {

      const res = await getPatientProfile();

      setProfile(res.data);



      if (!isPatientProfileComplete(res.data)) {

        setEditMode(true);

      }

    } catch (err) {

      setError("Failed to load profile");

      toast.error(getErrorMessage(err, "Failed to load profile"));

    } finally {

      setLoading(false);

    }

  };



  const handleChange = (e) => {

    setProfile({ ...profile, [e.target.name]: e.target.value });

  };



  const handlePasswordChange = (e) => {

    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  };



  const handleSave = async () => {

    if (!isPatientProfileComplete(profile)) {

      return toast.error("Name, phone, and age are required to book appointments");

    }



    try {

      const res = await updatePatientProfile({

        name: profile.name,

        phone: profile.phone,

        age: Number(profile.age),

      });



      setProfile(res.data);

      toast.success("Profile updated");

      setEditMode(false);

    } catch (err) {

      toast.error(getErrorMessage(err, "Update failed"));

    }

  };



  const handleChangePassword = async (e) => {

    e.preventDefault();



    const { currentPassword, newPassword, confirmPassword } = passwordForm;



    if (!currentPassword || !newPassword || !confirmPassword) {

      return toast.error("Please fill in all password fields");

    }



    if (!isValidPassword(newPassword)) {

      return toast.error(PASSWORD_RULES_HINT);

    }



    if (newPassword !== confirmPassword) {

      return toast.error("New passwords do not match");

    }



    setChangingPassword(true);



    try {

      await changePatientPassword({ currentPassword, newPassword });

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



  if (loading) {

    return (

      <div className="dashboard-card profile-page">

        <p className="text-muted">Loading profile...</p>

      </div>

    );

  }



  if (error) {

    return (

      <div className="dashboard-card profile-page">

        <p className="text-red-600">{error}</p>

        <div className="profile-actions">

          <button type="button" onClick={fetchProfile} className="btn-sky">

            Retry

          </button>

        </div>

      </div>

    );

  }



  const profileComplete = isPatientProfileComplete(profile);



  return (

    <div className="dashboard-card profile-page">

      <PageInfoBanner>
        Your profile details are required before you can book an appointment.
      </PageInfoBanner>



      {!profileComplete && (

        <p className="profile-alert">

          Please add your phone number and age to continue booking appointments.

        </p>

      )}



      <section className="profile-section">

        <h2 className="profile-section-title">Personal Information</h2>



        <div className="profile-form-grid">

          <div className="profile-field">

            <label className="auth-label" htmlFor="profile-name">

              Full name

            </label>

            <input

              id="profile-name"

              name="name"

              value={profile.name || ""}

              disabled={!editMode}

              onChange={handleChange}

              className="auth-input profile-input"

              placeholder="Enter your full name"

              required

            />

          </div>



          <div className="profile-field">

            <label className="auth-label" htmlFor="profile-email">

              Email address

            </label>

            <input

              id="profile-email"

              name="email"

              type="email"

              value={profile.email || ""}

              disabled

              className="auth-input profile-input profile-input-readonly"

              placeholder="Email"

            />

          </div>



          <div className="profile-field">

            <label className="auth-label" htmlFor="profile-phone">

              Phone number

            </label>

            <input

              id="profile-phone"

              name="phone"

              value={profile.phone || ""}

              disabled={!editMode}

              onChange={handleChange}

              className="auth-input profile-input"

              placeholder="Enter your phone number"

              required

            />

          </div>



          <div className="profile-field">

            <label className="auth-label" htmlFor="profile-age">

              Age

            </label>

            <input

              id="profile-age"

              name="age"

              type="number"

              min="1"

              value={profile.age || ""}

              disabled={!editMode}

              onChange={handleChange}

              className="auth-input profile-input"

              placeholder="Enter your age"

              required

            />

          </div>

        </div>



        <div className="profile-actions">

          {!editMode ? (

            <>

              <button

                type="button"

                onClick={() => setEditMode(true)}

                className="btn-sky"

              >

                Edit Profile

              </button>



              {profileComplete && (

                <Link to="/patient/book-appointment" className="btn-sky">

                  Book Appointment

                </Link>

              )}

            </>

          ) : (

            <>

              <button type="button" onClick={handleSave} className="btn-success">

                Save

              </button>



              {profileComplete && (

                <button

                  type="button"

                  onClick={() => setEditMode(false)}

                  className="btn-danger"

                >

                  Cancel

                </button>

              )}

            </>

          )}

        </div>

      </section>



      <section className="profile-section">

        <h2 className="profile-section-title">Change Password</h2>



        <form onSubmit={handleChangePassword}>

          <div className="profile-form-grid">

            <div className="profile-field profile-field-full">

              <PasswordField

                id="profile-current-password"

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

                id="profile-new-password"

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

                id="profile-confirm-password"

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



          <p className="profile-password-hint">{PASSWORD_RULES_HINT}</p>



          <div className="profile-actions profile-password-actions">

            <button

              type="submit"

              disabled={changingPassword}

              className="btn-hospital"

            >

              {changingPassword ? "Updating..." : "Update Password"}

            </button>

          </div>

        </form>

      </section>

    </div>

  );

}


