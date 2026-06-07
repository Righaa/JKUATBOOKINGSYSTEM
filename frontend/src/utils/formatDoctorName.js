export function formatDoctorName(name) {
  if (!name) return "Doctor";
  const trimmed = name.trim();
  if (/^dr\.?\s/i.test(trimmed)) return trimmed;
  return `Dr. ${trimmed}`;
}

export function sanitizeNotificationMessage(message) {
  if (!message) return message;
  return message.replace(/\bDr\.\s+Dr\.\s+/gi, "Dr. ");
}
