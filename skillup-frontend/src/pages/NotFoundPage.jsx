import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-cyan-700">
          Back to home
        </Link>
      </div>
    </div>
  );
}
