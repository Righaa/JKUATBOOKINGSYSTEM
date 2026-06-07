import { sanitizeNotificationMessage } from "./formatDoctorName";

export function getNotificationMeta(message) {
  const text = sanitizeNotificationMessage(message || "");
  const lower = text.toLowerCase();

  if (lower.includes("approved")) {
    return {
      type: "approved",
      label: "Appointment Approved",
      icon: "check",
    };
  }

  if (lower.includes("rejected")) {
    return {
      type: "rejected",
      label: "Appointment Rejected",
      icon: "x",
    };
  }

  if (lower.includes("cancelled")) {
    return {
      type: "cancelled",
      label: "Appointment Cancelled",
      icon: "cancel",
    };
  }

  if (lower.includes("new appointment request")) {
    return {
      type: "request",
      label: "New Booking Request",
      icon: "calendar",
    };
  }

  if (lower.includes("medical record") || lower.includes("diagnosis") || lower.includes("added a medical record")) {
    return {
      type: "medical",
      label: "Medical Record",
      icon: "medical",
    };
  }

  if (lower.includes("dr.") || lower.includes("doctor")) {
    return {
      type: "doctor",
      label: "Doctor Update",
      icon: "doctor",
    };
  }

  return {
    type: "general",
    label: "Hospital Update",
    icon: "bell",
  };
}

export function formatNotificationTime(createdAt, now = new Date()) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";

  const diffSec = Math.max(0, Math.floor((now - date) / 1000));

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec} secs ago`;

  const diffMins = Math.floor(diffSec / 60);
  if (diffMins < 60) return diffMins === 1 ? "1 min ago" : `${diffMins} mins ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
