export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block space-y-1">
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <input
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-500 transition focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
