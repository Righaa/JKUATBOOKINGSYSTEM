import { useEffect, useState } from "react";
import Modal from "../common/Modal";

export default function RejectAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  submitting = false,
  appointmentLabel = "",
}) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const handleClose = () => {
    if (submitting) return;
    setReason("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="dashboard-page-title" style={{ marginBottom: "0.5rem" }}>
        Reject appointment
      </h2>
      <p className="admin-form-hint admin-form-hint-compact">
        {appointmentLabel
          ? `Explain why ${appointmentLabel} is being rejected. The patient will be notified.`
          : "Provide a reason for rejecting this appointment. The patient will be notified."}
      </p>

      <form onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="rejection-reason">
          Rejection reason
        </label>
        <textarea
          id="rejection-reason"
          className="auth-input notes-area"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Doctor unavailable at the requested time"
          disabled={submitting}
          required
        />

        <div className="admin-form-actions admin-form-actions-split">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-danger"
            disabled={submitting || !reason.trim()}
          >
            {submitting ? "Rejecting..." : "Reject appointment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
