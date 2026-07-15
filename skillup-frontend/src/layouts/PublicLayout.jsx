import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen app-gradient text-skill-dark">
      <Navbar />
      <main className="pt-0">
        <Outlet />
      </main>

      <footer className="border-t border-skill-border bg-skill-dark py-12 px-4 text-[#d8e2dd]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
             <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-ui bg-skill-accent text-white font-bold">S</div>
                <span className="text-xl font-bold tracking-tight text-white">Skill<span className="text-skill-accent">Up</span></span>
             </div>
             <p className="max-w-sm text-sm">
               Empowering learners and tutors through AI-driven micro-learning experiences. Join our community today.
             </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-skill-accent transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-skill-accent transition-colors">Tutors</a></li>
              <li><a href="#" className="hover:text-skill-accent transition-colors">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-skill-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-skill-accent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-skill-accent transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-[#66706d] text-center text-xs">
          © {new Date().getFullYear()} SkillUp Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
