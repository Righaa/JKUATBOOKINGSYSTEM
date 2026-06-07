import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getDoctorPatient,
  getPatientMedicalRecords,
  createMedicalRecord,
} from "../../services/DoctorPortalService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import SectionHeader from "../../components/common/SectionHeader";

function appointmentStatusClass(status) {
  switch (status) {
    case "Approved":
      return "status-badge status-badge-approved";
    case "Rejected":
      return "status-badge status-badge-rejected";
    case "Cancelled":
      return "status-badge status-badge-cancelled";
    default:
      return "status-badge status-badge-pending";
  }
}

export default function DoctorPatientDetail() {
  const { patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    appointmentId: "",
    diagnosis: "",
    notes: "",
    prescription: "",
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const [patientRes, recordsRes] = await Promise.all([
        getDoctorPatient(patientId),
        getPatientMedicalRecords(patientId),
      ]);
      setPatient(patientRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load patient details"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await createMedicalRecord({
        patientId: Number(patientId),
        appointmentId: form.appointmentId ? Number(form.appointmentId) : null,
        diagnosis: form.diagnosis,
        notes: form.notes,
        prescription: form.prescription,
      });

      toast.success("Medical record saved");
      setForm({ appointmentId: "", diagnosis: "", notes: "", prescription: "" });
      setShowForm(false);
      setShowHistory(true);
      fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save medical record"));
    } finally {
      setSaving(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
    if (showHistory) setShowForm(false);
  };

  if (loading) {
    return (
      <div className="dashboard-card profile-page">
        <p className="text-muted">Loading patient...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="dashboard-card profile-page">
        <p className="text-muted">Patient not found.</p>
        <Link to="/doctor/patients" className="btn-sky mt-3 inline-flex">
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-card profile-page">
      <Link to="/doctor/patients" className="patient-back-link">
        ← Back to patient list
      </Link>

      <section className="profile-section">
        <SectionHeader>Patient Information</SectionHeader>
        <div className="profile-form-grid">
          <div className="profile-field">
            <label className="auth-label">Full name</label>
            <input
              className="auth-input profile-input profile-input-readonly"
              readOnly
              value={patient.name || "—"}
            />
          </div>
          <div className="profile-field">
            <label className="auth-label">Email address</label>
            <input
              className="auth-input profile-input profile-input-readonly"
              readOnly
              value={patient.email || "—"}
            />
          </div>
          <div className="profile-field">
            <label className="auth-label">Phone number</label>
            <input
              className="auth-input profile-input profile-input-readonly"
              readOnly
              value={patient.phone || "—"}
            />
          </div>
          <div className="profile-field">
            <label className="auth-label">Age</label>
            <input
              className="auth-input profile-input profile-input-readonly"
              readOnly
              value={patient.age ? String(patient.age) : "—"}
            />
          </div>
        </div>
      </section>

      <section className="profile-section">
        <SectionHeader>Appointments With You</SectionHeader>
        {!patient.appointments?.length ? (
          <p className="text-muted">No appointments found.</p>
        ) : (
          patient.appointments.map((app, index) => (
            <div key={app.id} className="history-record-card">
              <SectionHeader className="page-section-header-compact">
                Visit {index + 1} — {new Date(app.appointmentDate).toLocaleDateString()}
              </SectionHeader>
              <div className="profile-form-grid">
                <div className="profile-field">
                  <label className="auth-label">Date &amp; time</label>
                  <input
                    className="auth-input profile-input profile-input-readonly"
                    readOnly
                    value={new Date(app.appointmentDate).toLocaleString()}
                  />
                </div>
                <div className="profile-field">
                  <label className="auth-label">Status</label>
                  <div>
                    <span className={appointmentStatusClass(app.status)}>
                      {app.status}
                    </span>
                  </div>
                </div>
                <div className="profile-field profile-field-full">
                  <label className="auth-label">Reason</label>
                  <textarea
                    className="auth-input profile-input profile-input-readonly"
                    readOnly
                    rows={2}
                    value={app.reason || "No reason provided"}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      <div className="profile-actions">
        <button type="button" className="btn-sky" onClick={toggleHistory}>
          {showHistory ? "Hide Medical History" : "View Medical History"}
        </button>
        {showHistory && (
          <button
            type="button"
            className="btn-hospital"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel New Record" : "Add Medical Record"}
          </button>
        )}
      </div>

      {showHistory && (
        <section className="profile-section">
          <SectionHeader>Medical History</SectionHeader>

          {showForm && (
            <form onSubmit={handleSubmit} className="history-record-card mb-4">
              <SectionHeader className="page-section-header-compact">
                New Medical Record
              </SectionHeader>
              <div className="profile-form-grid">
                <div className="profile-field profile-field-full">
                  <label className="auth-label" htmlFor="record-appointment">
                    Link to appointment (optional)
                  </label>
                  <select
                    id="record-appointment"
                    name="appointmentId"
                    value={form.appointmentId}
                    onChange={handleChange}
                    className="auth-input profile-input"
                  >
                    <option value="">None</option>
                    {patient.appointments?.map((app) => (
                      <option key={app.id} value={app.id}>
                        {new Date(app.appointmentDate).toLocaleString()} — {app.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="profile-field profile-field-full">
                  <label className="auth-label" htmlFor="record-diagnosis">
                    Diagnosis
                  </label>
                  <input
                    id="record-diagnosis"
                    name="diagnosis"
                    value={form.diagnosis}
                    onChange={handleChange}
                    className="auth-input profile-input"
                    placeholder="Enter diagnosis"
                    required
                  />
                </div>
                <div className="profile-field profile-field-full">
                  <label className="auth-label" htmlFor="record-notes">
                    Clinical notes
                  </label>
                  <textarea
                    id="record-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="auth-input profile-input"
                    placeholder="Examination notes"
                    rows={3}
                  />
                </div>
                <div className="profile-field profile-field-full">
                  <label className="auth-label" htmlFor="record-prescription">
                    Prescription
                  </label>
                  <textarea
                    id="record-prescription"
                    name="prescription"
                    value={form.prescription}
                    onChange={handleChange}
                    className="auth-input profile-input"
                    placeholder="Medication and dosage"
                    rows={3}
                  />
                </div>
              </div>
              <div className="profile-actions profile-password-actions">
                <button type="submit" disabled={saving} className="btn-success">
                  {saving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          )}

          {records.length === 0 ? (
            <p className="text-muted">No medical records yet.</p>
          ) : (
            records.map((record, index) => (
              <div key={record.id} className="history-record-card">
                <SectionHeader className="page-section-header-compact">
                  Record {index + 1} — {new Date(record.createdAt).toLocaleDateString()}
                </SectionHeader>
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label className="auth-label">Date recorded</label>
                    <input
                      className="auth-input profile-input profile-input-readonly"
                      readOnly
                      value={new Date(record.createdAt).toLocaleString()}
                    />
                  </div>
                  <div className="profile-field">
                    <label className="auth-label">Diagnosis</label>
                    <input
                      className="auth-input profile-input profile-input-readonly"
                      readOnly
                      value={record.diagnosis || "—"}
                    />
                  </div>
                  <div className="profile-field profile-field-full">
                    <label className="auth-label">Clinical notes</label>
                    <textarea
                      className="auth-input profile-input profile-input-readonly"
                      readOnly
                      rows={2}
                      value={record.notes || "—"}
                    />
                  </div>
                  <div className="profile-field profile-field-full">
                    <label className="auth-label">Prescription</label>
                    <textarea
                      className="auth-input profile-input profile-input-readonly"
                      readOnly
                      rows={2}
                      value={record.prescription || "—"}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
