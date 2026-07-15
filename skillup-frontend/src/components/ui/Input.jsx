export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-skill-dark/90">{label}</span> : null}
      <input
        className={`w-full rounded-input border border-skill-border bg-white px-4 py-2.5 text-sm text-skill-dark outline-none transition-all focus:border-skill-accent focus:ring-4 focus:ring-[#4fb28f33] ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-skill-error">{error}</span> : null}
    </label>
  );
}
