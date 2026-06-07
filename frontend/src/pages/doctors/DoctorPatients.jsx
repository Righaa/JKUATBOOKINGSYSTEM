import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctorPatients } from "../../services/DoctorPortalService";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import PageInfoBanner from "../../components/common/PageInfoBanner";

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await getDoctorPatients();
      setPatients(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load patients"));
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (id) => {
    navigate(`/doctor/patients/${id}`);
  };

  if (loading) {
    return (
      <div className="dashboard-card profile-page">
        <p className="text-muted">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card profile-page">
      <PageInfoBanner>
        Select a patient to view their full profile and medical history.
      </PageInfoBanner>

      {patients.length === 0 ? (
        <p className="text-muted">No patients have booked with you yet.</p>
      ) : (
        <ul className="patient-list">
          {patients.map((patient) => (
            <li key={patient.id}>
              <button
                type="button"
                className="patient-list-row"
                onClick={() => handlePatientClick(patient.id)}
              >
                <div className="patient-list-main">
                  <span className="patient-list-name">{patient.name}</span>
                  <span className="patient-list-meta">
                    {patient.phone || patient.email || "No contact"}
                  </span>
                </div>
                <div className="patient-list-side">
                  <span className="specialty-badge">
                    {patient.appointmentCount} appt
                    {patient.appointmentCount === 1 ? "" : "s"}
                  </span>
                  <span className="patient-list-chevron" aria-hidden="true">
                    ›
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
