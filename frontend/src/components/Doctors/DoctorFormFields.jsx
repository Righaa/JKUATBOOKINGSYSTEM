import { DOCTOR_SPECIALTIES } from "../../constants/doctorSpecialties";

export default function DoctorFormFields({ form, onChange, idPrefix = "doctor-" }) {
  return (
    <div className="profile-form-grid">
      <div className="profile-field">
        <label className="auth-label" htmlFor={`${idPrefix}name`}>
          Full name
        </label>
        <input
          id={`${idPrefix}name`}
          name="name"
          value={form.name || ""}
          onChange={onChange}
          className="auth-input profile-input"
          placeholder="e.g. Dr. Jane Wanjiku"
          required
        />
      </div>

      <div className="profile-field">
        <label className="auth-label" htmlFor={`${idPrefix}email`}>
          Email address
        </label>
        <input
          id={`${idPrefix}email`}
          name="email"
          type="email"
          value={form.email || ""}
          onChange={onChange}
          className="auth-input profile-input"
          placeholder="doctor@jkuat.ac.ke"
          required
        />
      </div>

      <div className="profile-field">
        <label className="auth-label" htmlFor={`${idPrefix}specialty`}>
          Specialty
        </label>
        <select
          id={`${idPrefix}specialty`}
          name="specialty"
          value={form.specialty || "General Doctor"}
          onChange={onChange}
          className="auth-input profile-input"
          required
        >
          {DOCTOR_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="profile-field">
        <label className="auth-label" htmlFor={`${idPrefix}phone`}>
          Phone number
        </label>
        <input
          id={`${idPrefix}phone`}
          name="phone"
          type="tel"
          value={form.phone || ""}
          onChange={onChange}
          className="auth-input profile-input"
          placeholder="+254 7XX XXX XXX"
        />
      </div>
    </div>
  );
}
