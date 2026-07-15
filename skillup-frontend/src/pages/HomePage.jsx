import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

// Simple Icons
const Icons = {
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
};

export default function HomePage() {
  return (
    <div className="app-gradient text-skill-dark font-sans">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-skill-dark text-white">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-skill-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-[#8ca39a33] rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#c9e7dc] text-xs font-semibold tracking-wider uppercase mb-8">
            <span className="flex h-2 w-2 rounded-full bg-skill-accent animate-pulse"></span>
            Next-Gen Learning Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-white leading-tight">
            Master Any Skill with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a9e0cb] to-[#4fb28f]">Personalized AI Mentoring.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#d8e2dd] mb-10 leading-relaxed">
            SkillUp connects ambitious learners with expert tutors and cutting-edge AI tools to accelerate your career and personal growth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="px-8 py-4 text-white text-lg">
                Start Learning Now
              </Button>
            </Link>
            <Link to="/login">
              <button className="flex items-center gap-2 px-8 py-4 text-white hover:text-[#c8e4d8] transition-colors font-semibold group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 group-hover:border-[#b2d9c9] group-hover:bg-[#7abda512] transition-all">
                    <Icons.Play />
                </div>
                See How It Works
              </button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-xl font-bold italic tracking-tighter">TECHLEARN</span>
              <span className="text-xl font-bold italic tracking-tighter">SKILLFLOW</span>
              <span className="text-xl font-bold italic tracking-tighter">EDUCORE</span>
              <span className="text-xl font-bold italic tracking-tighter">MINDGROW</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-semibold text-skill-accent uppercase tracking-widest mb-3">Core Features</h2>
            <p className="text-3xl md:text-4xl font-semibold text-skill-dark">Designed for modern education.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "AI-Powered Insights", 
                desc: "Get personalized feedback and learning paths generated by our advanced AI algorithms.", 
                icon: <Icons.Zap />,
                color: "bg-[#fff4d7] text-[#9b7a14]"
              },
              { 
                title: "Expert Tutors", 
                desc: "Connect 1-on-1 with industry veterans who can guide you through complex challenges.", 
                icon: <Icons.Users />,
                color: "bg-[#dff2ea] text-skill-accentHover"
              },
              { 
                title: "Global Community", 
                desc: "Join a network of thousands of students and share your progress with peers.", 
                icon: <Icons.Globe />,
                color: "bg-[#e7efeb] text-skill-dark"
              }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-card border border-skill-border bg-white/90 hover:bg-white hover:shadow-card transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-6`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-skill-dark mb-3">{f.title}</h3>
                <p className="text-[#68706d] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-semibold text-skill-dark mb-6 leading-tight">
                        Transforming how you learn, <br className="hidden md:block" /> 
                        one lesson at a time.
                    </h2>
                    <div className="space-y-6">
                        {[
                            "Micro-learning modules for quick retention",
                            "Real-time booking with instant tutor availability",
                            "Interactive assignments with automated grading",
                            "Gamified progress tracking and rewards"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#dff2ea] text-skill-accentHover flex items-center justify-center">
                                    <Icons.Check />
                                </div>
                                <span className="text-skill-dark/90 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10">
                        <Link to="/register">
                              <Button className="px-8 py-3">Explore the Platform</Button>
                        </Link>
                    </div>
                </div>
                <div className="flex-1 relative">
                          <div className="relative z-10 rounded-card overflow-hidden shadow-card border-[10px] border-white">
                            <div className="aspect-video bg-[#dce5e0] flex items-center justify-center">
                             {/* Mockup or Illustration Placeholder */}
                             <div className="text-center p-8">
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-soft text-skill-accent">
                                    <Icons.Play />
                                </div>
                                <p className="text-sm font-semibold text-skill-dark/60 uppercase tracking-widest">Platform Preview</p>
                             </div>
                        </div>
                    </div>
                    {/* Decorative elements */}
                          <div className="absolute -top-10 -right-10 w-40 h-40 bg-skill-accent/20 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#8ca39a33] rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
        <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-skill-accent to-[#3f9d7d] rounded-[2rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-card">
                <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to reach your potential?</h2>
              <p className="text-[#e6f5ee] text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Join our community of over 15,000 learners today and start your journey towards mastery.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                         <Link to="/register">
                  <Button className="px-10 py-4 bg-white text-skill-dark hover:bg-[#f6fbf8] text-lg font-semibold">Create Free Account</Button>
                         </Link>
                 <p className="text-sm text-[#e6f5ee]">No credit card required</p>
                    </div>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </div>
      </section>
    </div>
  );
}
