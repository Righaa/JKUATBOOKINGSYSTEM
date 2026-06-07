export const PASSWORD_RULES_HINT =
  "At least 8 characters including uppercase, lowercase, a number, and a special character.";

export function isValidPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/']).{8,}$/.test(
    password
  );
}
