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
  const [menuOpen, setMenuOpen] = useState(false);

  const links = useMemo(() => {
    if (role === 'tutor') return tutorLinks;
    if (role === 'admin') return adminLinks;
    return learnerLinks;
  }, [role]);

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const renderNavLinks = (isMobile = false) => (
    <nav className="space-y-2">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => {
            if (isMobile) setMenuOpen(false);
          }}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-ui px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-skill-accent text-white shadow-soft'
                : 'text-[#dbe5e0] hover:bg-[#636a67] hover:text-white'
            }`
          }
        >
          <span className="opacity-90 group-hover:opacity-100">
            <link.icon />
          </span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-skill-bg font-sans text-skill-dark">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-skill-dark border-r border-[#67716d] shadow-card">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-6 border-b border-[#67716d]">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-ui bg-skill-accent text-white font-bold group-hover:bg-skill-accentHover transition-colors">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Skill<span className="text-skill-accent">Up</span></span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="mb-4 px-2 text-[11px] font-semibold tracking-[0.12em] text-[#c8d4ce] uppercase">
            Main Menu
          </div>
          {renderNavLinks()}

          <div className="mt-8 mb-4 px-2 text-[11px] font-semibold tracking-[0.12em] text-[#c8d4ce] uppercase">
            System
          </div>
          <nav className="space-y-2">
             <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#dbe5e0] rounded-ui hover:bg-[#6a5654] hover:text-white transition-all duration-200"
            >
              <Icons.Logout />
              Logout
            </button>
          </nav>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-[#67716d] bg-[#4a4f4d]">
          <div className="flex items-center gap-3 p-2 rounded-ui border border-[#67716d] bg-[#5a615f] transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#d9eee5] flex items-center justify-center text-skill-dark font-bold border border-[#b6d7c9] uppercase">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-[#d2ddd8] truncate capitalize">{role || 'Learner'}</p>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[#23292799]"
          />
          <div className="relative h-full w-72 bg-skill-dark p-4 shadow-card animate-fadeUp">
            <div className="mb-6 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <div className="flex items-center justify-center w-9 h-9 rounded-ui bg-skill-accent text-white font-bold">S</div>
                <span className="text-xl font-bold tracking-tight text-white">Skill<span className="text-skill-accent">Up</span></span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-ui border border-[#6f7976] text-white"
                aria-label="Close menu"
              >
                X
              </button>
            </div>

            <div className="mb-3 px-2 text-[11px] font-semibold tracking-[0.12em] text-[#c8d4ce] uppercase">
              Main Menu
            </div>
            {renderNavLinks(true)}

            <div className="mt-8 mb-3 px-2 text-[11px] font-semibold tracking-[0.12em] text-[#c8d4ce] uppercase">
              System
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-[#dbe5e0] rounded-ui hover:bg-[#6a5654] hover:text-white transition-all duration-200"
            >
              <Icons.Logout />
              Logout
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-[#f7faf8] border-b border-skill-border flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
             <button
               type="button"
               onClick={() => setMenuOpen(true)}
               className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-ui border border-skill-border bg-white text-skill-dark"
               aria-label="Open sidebar menu"
             >
               ☰
             </button>
             {/* Search Placeholder */}
             <div className="hidden md:flex items-center w-full max-w-md h-10 px-3 bg-white border border-skill-border rounded-input text-skill-dark/70 hover:bg-[#f7faf8] transition-colors cursor-text group">
                <Icons.Search />
                <span className="ml-2 text-sm">Quick search...</span>
                <span className="ml-auto text-[10px] font-semibold bg-[#f3f7f5] border border-skill-border px-1.5 py-0.5 rounded text-skill-dark/50">⌘K</span>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-skill-dark/70 hover:bg-white rounded-ui transition-colors relative border border-transparent hover:border-skill-border">
              <Icons.Bell />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-skill-error border-2 border-white rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-skill-border mx-1"></div>
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white transition-colors border border-transparent hover:border-skill-border">
              <div className="w-8 h-8 rounded-full bg-[#e1ece7] flex items-center justify-center text-skill-dark font-medium text-xs">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 app-gradient">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
