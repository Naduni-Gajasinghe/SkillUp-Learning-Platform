import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-amber-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-white/60 bg-white/90 p-7 shadow-lg backdrop-blur">
        <div className="mb-6">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-cyan-700">
            SkillUp
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
