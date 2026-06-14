import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from './ui/Button';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 shadow-sm' : 'bg-transparent py-5'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold group-hover:bg-cyan-700 transition-colors">
                S
              </div>
              <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-white'}`}>
                Skill<span className="text-cyan-500">Up</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors hover:text-cyan-500 ${
                    isScrolled ? 'text-slate-600' : 'text-slate-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/app">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className={`text-sm font-medium hover:text-cyan-500 transition-colors ${
                  isScrolled ? 'text-slate-600' : 'text-slate-200'
                }`}>
                  Sign In
                </Link>
                <Link to="/register">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100 border border-slate-200">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
