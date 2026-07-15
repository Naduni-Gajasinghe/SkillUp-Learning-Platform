import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from './ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/learner/tutors', label: 'Find Tutors' },
    { to: '/about', label: 'About' },
  ];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-[#515654f2] backdrop-blur border-b border-[#66706d] py-3 shadow-card'
        : 'bg-[#515654] py-4'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8 min-w-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-ui bg-skill-accent text-white font-bold group-hover:bg-skill-accentHover transition-colors">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Skill<span className="text-skill-accent">Up</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2 rounded-full border border-[#68726f] bg-[#5a605e] p-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    location.pathname === link.to
                      ? 'bg-[#ebf0ea] text-skill-dark shadow-soft'
                      : 'text-[#e3ebe7] hover:bg-[#68706d] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/app">
                  <Button className="hidden sm:inline-flex">Go to Dashboard</Button>
                </Link>
                <Link
                  to="/app"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7b8783] bg-[#5e6663] text-sm font-bold uppercase text-[#ecf2ee]"
                  aria-label="Open dashboard"
                >
                  {user?.fullName?.charAt(0) || 'U'}
                </Link>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm font-medium text-[#e4ece8] hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/register">
                  <Button className="bg-[#ebf0ea] text-skill-dark hover:bg-white border border-[#d5dfda]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-ui border border-[#74807c] text-[#eef4f0]"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? 'X' : '≡'}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="md:hidden mt-4 rounded-card border border-[#6f7976] bg-[#5a615f] p-3 shadow-soft animate-fadeUp">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block rounded-ui px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-[#ebf0ea] text-skill-dark'
                      : 'text-[#e4ece8] hover:bg-[#6b7471] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {!user ? (
                <Link to="/login" className="block rounded-ui px-3 py-2 text-sm font-medium text-[#e4ece8] hover:bg-[#6b7471] hover:text-white">
                  Sign In
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
