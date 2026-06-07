import { useEffect, useState, useMemo } from "react";
import { getDoctors, deleteDoctor, updateDoctor } from "../../services/DoctorService";
import { DOCTOR_SPECIALTIES } from "../../constants/doctorSpecialties";
import DoctorForm from "../../components/Doctors/DoctorsForm";
import DoctorFormFields from "../../components/Doctors/DoctorFormFields";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";
import { getErrorMessage } from "../../utils/getErrorMessage";
import { formatDoctorName } from "../../utils/formatDoctorName";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    specialty: "General Doctor",
    phone: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load doctors"));
    }
  };

  const groupedDoctors = useMemo(() => {
    const groups = {};
    DOCTOR_SPECIALTIES.forEach((s) => {
      groups[s] = [];
    });
    doctors.forEach((doc) => {
      const key = doc.specialty || "General Doctor";
      if (!groups[key]) groups[key] = [];
      groups[key].push(doc);
    });
    return groups;
  }, [doctors]);

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setEditData({
      name: doctor.name || "",
      email: doctor.email || "",
      specialty: doctor.specialty || "General Doctor",
      phone: doctor.phone || "",
    });
    setIsOpen(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await updateDoctor(selectedDoctor.id, editData);
      toast.success("Doctor updated successfully");
      setIsOpen(false);
      fetchDoctors();
    } catch (err) {
      toast.error(getErrorMessage(err, "Update failed"));
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this doctor from the system?")) return;

    try {
      await deleteDoctor(id);
      toast.success("Doctor deleted");
      fetchDoctors();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed"));
    }
  };

  const hasDoctors = doctors.length > 0;

  return (
    <div className="admin-page">
      <div className="dashboard-card admin-form-card">
        <DoctorForm onSuccess={fetchDoctors} />
      </div>

      <div className="dashboard-card">
        <h2 className="profile-section-title">Registered Doctors</h2>

        {!hasDoctors ? (
          <p className="admin-empty-state">No doctors yet. Add one using the form above.</p>
        ) : (
          DOCTOR_SPECIALTIES.map((specialty) => {
            const list = groupedDoctors[specialty] || [];
            if (list.length === 0) return null;

            return (
              <section key={specialty} className="admin-list-section">
                <h3 className="specialty-group-title">{specialty}</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Doctor ID</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((doc) => (
                        <tr key={doc.id}>
                          <td className="admin-table-name">{formatDoctorName(doc.name)}</td>
                          <td>
                            <span className="admin-id-badge">{doc.id}</span>
                          </td>
                          <td>{doc.email}</td>
                          <td>{doc.phone || "—"}</td>
                          <td>
                            <div className="admin-table-actions">
                              <button
                                type="button"
                                onClick={() => openEditModal(doc)}
                                className="btn-secondary"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(doc.id)}
                                className="btn-danger btn-compact"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form onSubmit={handleUpdate} className="admin-form admin-modal-form">
          <h2 className="profile-section-title">Edit Doctor</h2>
          <p className="admin-form-hint admin-form-hint-compact">
            Doctor ID: <strong>{selectedDoctor?.id}</strong>
          </p>

          <DoctorFormFields
            form={editData}
            onChange={handleChange}
            idPrefix="edit-"
          />

          <div className="admin-form-actions admin-form-actions-split">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-hospital" disabled={updating}>
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
