import { useState } from "react";
import { createDoctor } from "../../services/DoctorService";
import DoctorFormFields from "./DoctorFormFields";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";

const emptyForm = {
  name: "",
  email: "",
  specialty: "General Doctor",
  phone: "",
};

export default function DoctorForm({ onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await createDoctor(form);
      const doctorId = res.data?.doctorId ?? res.data?.doctor?.doctorId;
      toast.success(
        doctorId ? `Doctor added. Doctor ID: ${doctorId}` : "Doctor added successfully",
        { autoClose: 8000 }
      );
      setForm(emptyForm);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add doctor"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <section className="profile-section">
        <h2 className="profile-section-title">Add New Doctor</h2>
        <p className="admin-form-hint">
          New doctors receive a Doctor ID after creation. Share login credentials securely with the doctor.
        </p>

        <DoctorFormFields form={form} onChange={handleChange} idPrefix="add-" />

        <div className="admin-form-actions">
          <button type="submit" className="btn-hospital" disabled={submitting}>
            {submitting ? "Adding..." : "Add Doctor"}
          </button>
        </div>
      </section>
    </form>
  );
}
