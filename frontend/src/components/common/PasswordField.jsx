export default function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggleShow,
  disabled = false,
  variant = "profile",
  autoComplete,
  required = false,
  minLength,
}) {
  const fieldClass = variant === "auth" ? "auth-password-field" : "profile-field";
  const inputClass =
    variant === "auth"
      ? "auth-input password-input auth-password-input"
      : "auth-input profile-input password-input";

  return (
    <div className={fieldClass}>
      <label className="auth-label" htmlFor={id}>
        {label}
      </label>
      <div className="password-field-wrap">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={inputClass}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={onToggleShow}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
