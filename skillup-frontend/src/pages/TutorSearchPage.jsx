import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { fetchTutors } from '../services/bookingService';

// Icons
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Star: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function TutorSearchPage() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        const data = await fetchTutors(params);
        setTutors(data);
      } catch {
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 md:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expert Tutors</h1>
        <p className="text-lg text-slate-600 font-medium">Connect with industry professionals and accelerate your learning.</p>
      </header>

      {/* Modern Search bar */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-600 transition-colors">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Search by name, expertise, or subject..."
          className="w-full rounded-[2rem] border-2 border-slate-100 bg-white py-5 pl-12 pr-6 text-base text-slate-900 shadow-xl shadow-slate-100 transition-all focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block">
            <span className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {tutors.length} Tutors Found
            </span>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[400px] rounded-[2.5rem] bg-slate-50 animate-pulse border-2 border-slate-100"></div>
            ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                <Icons.Search />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No tutors match your search</h3>
            <p className="mt-2 text-slate-600">Try broadening your search terms or exploring different categories.</p>
            <button onClick={() => setSearch('')} className="mt-8 text-cyan-600 font-black uppercase tracking-widest text-xs hover:text-cyan-700 underline underline-offset-8">Clear all filters</button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => {
            const profile = tutor.tutorProfile || {};
            const availabilities = tutor.availabilities || [];
            const availableDays = [...new Set(availabilities.map((a) => DAY_NAMES[a.dayOfWeek]))];

            return (
              <div
                key={tutor.id}
                onClick={() => navigate(`/learner/tutors/${tutor.id}`)}
                className="group relative cursor-pointer flex flex-col rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-cyan-200 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-1"
              >
                {/* Availability Badge */}
                <div className="absolute top-6 right-6 z-10">
                    {profile.isAvailable ? (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-emerald-700 border border-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-400 border border-slate-100">
                            Away
                        </div>
                    )}
                </div>

                {/* Profile Visual */}
                <div className="flex items-center gap-5 mb-6">
                  {tutor.profileImage ? (
                    <img
                      src={tutor.profileImage.startsWith('http') ? tutor.profileImage : `http://localhost:5000${tutor.profileImage.startsWith('/') ? '' : '/'}${tutor.profileImage}`}
                      alt={tutor.fullName}
                      className="h-20 w-20 rounded-3xl object-cover border-4 border-white shadow-xl shadow-slate-200 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-3xl font-black text-white shadow-xl shadow-cyan-200 group-hover:scale-105 transition-transform duration-500">
                      {tutor.fullName?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-cyan-600 transition-colors leading-tight mb-1">
                      {tutor.fullName}
                    </h3>
                    <div className="flex items-center gap-1">
                        <Icons.Star />
                        <span className="text-xs font-black text-slate-900">4.9</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">(120+ Reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Expertise Chips */}
                {profile.expertise && (
                  <div className="flex flex-wrap gap-2 mb-6">
                      {profile.expertise.split(',').slice(0, 3).map((exp, idx) => (
                          <span key={idx} className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest truncate">
                              {exp.trim()}
                          </span>
                      ))}
                  </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4 mt-auto mb-6">
                    <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Icons.Clock />
                            <span className="text-[10px] font-black uppercase tracking-widest">Rate</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">LKR {profile.hourlyRate || '??'}/hr</p>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-50/50 border border-slate-100 group-hover:bg-white transition-colors">
                        <div className="flex items-center gap-2 mb-1 text-slate-400">
                            <Icons.Users />
                            <span className="text-[10px] font-black uppercase tracking-widest">Exp.</span>
                        </div>
                        <p className="text-sm font-black text-slate-900">{profile.experience || '0'}+ Years</p>
                    </div>
                </div>

                {/* Bio Preview */}
                {tutor.bio && (
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-6 font-medium italic">
                    " {tutor.bio} "
                  </p>
                )}

                {/* Availability Row */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                    <div className="flex -space-x-1.5">
                        {availableDays.map((day) => (
                        <div key={day} className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-white text-[8px] font-black border-2 border-white uppercase shadow-sm">
                            {day.slice(0, 2)}
                        </div>
                        ))}
                    </div>
                    <button className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:text-cyan-700 transition-colors">
                        Book Session
                    </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
