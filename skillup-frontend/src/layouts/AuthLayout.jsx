import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, illustration }) {
  return (
    <div className="min-h-screen flex bg-skill-bg font-sans">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-ui bg-skill-accent text-white font-bold shadow-soft transition-transform group-hover:scale-105">
                S
              </div>
              <span className="text-2xl font-bold tracking-tight text-skill-dark">Skill<span className="text-skill-accent">Up</span></span>
            </Link>
            <h2 className="mt-10 text-[36px] font-bold text-skill-dark tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-skill-dark/80">
              {subtitle}
            </p>
          </div>

          <div className="mt-10 rounded-card border border-skill-border bg-white p-6 shadow-soft">
            <div className="mt-1">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Visual/Illustration (Hidden on mobile) */}
      <div className="hidden lg:block relative flex-1 w-0">
        <div className="absolute inset-0 h-full w-full bg-skill-dark overflow-hidden">
            {/* Abstract Background Pattern */}
          <div className="absolute inset-0 opacity-30">
                <svg className="h-full w-full" fill="none" viewBox="0 0 400 400">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#5e6e68] via-[#515654] to-[#434947]"></div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white text-center">
                <div className="max-w-md">
                <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-card mb-8 border border-white/20">
                        {illustration || (
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold mb-4">Elevate your skills with AI-driven learning.</h3>
                <p className="text-[#d8e4de] text-lg">
                        Join thousands of learners and expert tutors in a platform designed for the future of education.
                    </p>
                    
                    <div className="mt-12 grid grid-cols-2 gap-6 text-left">
                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-ui border border-white/10">
                            <p className="text-2xl font-bold">15k+</p>
                    <p className="text-sm text-[#d3e2da]">Active Learners</p>
                        </div>
                  <div className="p-4 bg-white/5 backdrop-blur-sm rounded-ui border border-white/10">
                            <p className="text-2xl font-bold">1.2k+</p>
                    <p className="text-sm text-[#d3e2da]">Expert Tutors</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
