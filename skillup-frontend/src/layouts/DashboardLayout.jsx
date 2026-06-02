import { useMemo } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import Button from '../components/ui/Button';

const learnerLinks = [
  { to: '/learner/dashboard', label: 'Dashboard' },
  { to: '/learner/profile', label: 'Profile' },
  { to: '/learner/lessons', label: 'Lessons' },
  { to: '/learner/tutors', label: 'Find Tutors' },
  { to: '/learner/bookings', label: 'Bookings' },
  { to: '/learner/submissions', label: 'Submissions' },
  { to: '/learner/gamification', label: 'Gamification' },
];

const tutorLinks = [
  { to: '/tutor/dashboard', label: 'Dashboard' },
  { to: '/tutor/profile', label: 'Profile' },
  { to: '/tutor/lessons', label: 'Lessons' },
  { to: '/tutor/bookings', label: 'Bookings' },
  { to: '/tutor/reviews', label: 'Reviews' },
  { to: '/tutor/analytics', label: 'Analytics' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
];

export default function DashboardLayout({ role }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const links = useMemo(() => {
    if (role === 'tutor') return tutorLinks;
    if (role === 'admin') return adminLinks;
    return learnerLinks;
  }, [role]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-cyan-700">SkillUp</Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.fullName || 'User'}</p>
              <p className="text-xs text-slate-500">{(user?.roles || []).join(', ')}</p>
            </div>
            <Button variant="secondary" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[240px,1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3">
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-cyan-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
