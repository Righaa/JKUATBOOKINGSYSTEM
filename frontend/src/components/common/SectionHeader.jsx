export default function SectionHeader({ children, className = "" }) {
  return (
    <h2 className={`page-section-header ${className}`.trim()}>{children}</h2>
  );
}
