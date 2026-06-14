import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import Button from '../components/ui/Button';

// Simple SVG Icons
const Icons = {
  Dashboard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  Profile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Lessons: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Tutors: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Bookings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Submissions: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  Gamification: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15-2 5-2-5-5-2 5-2 2-5 2 5 5 2-5 2Z"/><path d="M2 20h.01"/><path d="M7 21h.01"/><path d="M12 22h.01"/><path d="M17 21h.01"/><path d="M22 20h.01"/></svg>
  ),
  Reviews: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Analytics: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Logout: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Bell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
  ),
};

const learnerLinks = [
  { to: '/learner/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { to: '/learner/lessons', label: 'My Lessons', icon: Icons.Lessons },
  { to: '/learner/tutors', label: 'Find Tutors', icon: Icons.Tutors },
  { to: '/learner/bookings', label: 'Bookings', icon: Icons.Bookings },
  { to: '/learner/submissions', label: 'Submissions', icon: Icons.Submissions },
  { to: '/learner/gamification', label: 'Gamification', icon: Icons.Gamification },
  { to: '/learner/profile', label: 'Profile', icon: Icons.Profile },
];

const tutorLinks = [
  { to: '/tutor/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
  { to: '/tutor/lessons', label: 'My Lessons', icon: Icons.Lessons },
  { to: '/tutor/bookings', label: 'Bookings', icon: Icons.Bookings },
  { to: '/tutor/reviews', label: 'Reviews', icon: Icons.Reviews },
  { to: '/tutor/analytics', label: 'Analytics', icon: Icons.Analytics },
  { to: '/tutor/profile', label: 'Profile', icon: Icons.Profile },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: Icons.Dashboard },
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
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold group-hover:bg-cyan-700 transition-colors">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Skill<span className="text-cyan-600">Up</span></span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-4 px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Main Menu
          </div>
          <nav className="space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-cyan-50 text-cyan-700 shadow-sm ring-1 ring-cyan-200' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <link.icon />
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 mb-4 px-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            System
          </div>
          <nav className="space-y-1">
             <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
            >
              <Icons.Logout />
              Logout
            </button>
          </nav>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold border border-cyan-200 uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{role || 'Learner'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-1">
             {/* Search Placeholder */}
             <div className="hidden md:flex items-center w-full max-w-md h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-200/50 transition-colors cursor-text group">
                <Icons.Search />
                <span className="ml-2 text-sm">Quick search...</span>
                <span className="ml-auto text-[10px] font-semibold bg-white border border-slate-300 px-1.5 py-0.5 rounded shadow-sm text-slate-400">⌘K</span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Icons.Bell />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
