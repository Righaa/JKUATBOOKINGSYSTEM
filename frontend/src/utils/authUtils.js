import { jwtDecode } from "jwt-decode";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ID_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

export function isTokenExpired(token) {
  const decoded = jwtDecode(token);
  if (!decoded.exp) return false;
  return decoded.exp * 1000 < Date.now();
}

export function parseAuthUser(token) {
  const decoded = jwtDecode(token);

  return {
    ...decoded,
    id: decoded[ID_CLAIM] ?? decoded.sub ?? decoded.id,
    email: decoded[EMAIL_CLAIM] ?? decoded.email,
    role: decoded[ROLE_CLAIM] ?? decoded.role ?? "Patient",
    doctorId: decoded.doctorId ? Number(decoded.doctorId) : null,
  };
}

export function getDashboardPath(role) {
  switch (role) {
    case "Admin":
      return "/admin/dashboard";
    case "Doctor":
      return "/doctor/dashboard";
    case "Patient":
      return "/patient/dashboard";
    default:
      return "/";
  }
}
