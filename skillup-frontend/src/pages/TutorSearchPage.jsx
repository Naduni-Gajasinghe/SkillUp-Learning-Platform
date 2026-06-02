import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import { fetchTutors } from '../services/bookingService';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Find Tutors</h1>
        <p className="text-sm text-slate-600">
          Search tutors by name or expertise, view their profile and book a session.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search by name or expertise..."
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
        </div>
      ) : tutors.length === 0 ? (
        <Card>
          <div className="py-8 text-center">
            <p className="text-lg font-medium text-slate-700">No tutors found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => {
            const profile = tutor.tutorProfile || {};
            const availabilities = tutor.availabilities || [];
            const availableDays = [...new Set(availabilities.map((a) => DAY_NAMES[a.dayOfWeek]))];

            return (
              <button
                key={tutor.id}
                type="button"
                onClick={() => navigate(`/learner/tutors/${tutor.id}`)}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cyan-400 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  {tutor.profileImage ? (
                    <img
                      src={tutor.profileImage.startsWith('http') ? tutor.profileImage : `http://localhost:5000/${tutor.profileImage}`}
                      alt={tutor.fullName}
                      className="h-12 w-12 rounded-full object-cover border-2 border-slate-100"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-lg font-bold text-cyan-700">
                      {tutor.fullName?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-cyan-700 transition">
                      {tutor.fullName}
                    </p>
                    {profile.expertise && (
                      <p className="mt-0.5 text-xs text-slate-500 truncate">{profile.expertise}</p>
                    )}
                  </div>
                  {profile.isAvailable ? (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Available
                    </span>
                  ) : (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                      Unavailable
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  {profile.hourlyRate != null && (
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">Rate</span>
                      <span className="font-semibold text-slate-800">LKR {profile.hourlyRate}/hr</span>
                    </div>
                  )}
                  {profile.experience != null && (
                    <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                      <span className="block text-[10px] uppercase tracking-wide text-slate-400">Experience</span>
                      <span className="font-semibold text-slate-800">{profile.experience} yrs</span>
                    </div>
                  )}
                </div>

                {/* Availability days */}
                {availableDays.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {availableDays.map((day) => (
                      <span key={day} className="rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700">
                        {day}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio preview */}
                {tutor.bio && (
                  <p className="mt-3 text-xs text-slate-500 line-clamp-2">{tutor.bio}</p>
                )}

                <div className="mt-4 text-xs font-semibold text-cyan-600 group-hover:text-cyan-700 transition">
                  View profile →
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
