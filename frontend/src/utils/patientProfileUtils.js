export function isPatientProfileComplete(profile) {
  if (!profile) return false;

  const name = (profile.name ?? "").trim();
  const phone = (profile.phone ?? "").trim();
  const age = Number(profile.age);

  return name.length > 0 && phone.length > 0 && age > 0;
}
