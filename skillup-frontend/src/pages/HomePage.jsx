import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800 px-4 py-16 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">SkillUp Platform</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Micro-learning Platfrom for learners and tutors.
        </h1>
        <p className="mt-5 max-w-2xl text-slate-200">
          Start with authentication, then continue feature-by-feature through lessons, bookings, submissions, and analytics.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login">
            <Button className="bg-cyan-500 hover:bg-cyan-400">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary">Create Account</Button>
          </Link>
          <Link to="/app">
            <Button variant="ghost" className="text-white hover:bg-white/10">Go to My App</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
