export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-card border border-skill-border bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${className}`}>
      {children}
    </div>
  );
}
