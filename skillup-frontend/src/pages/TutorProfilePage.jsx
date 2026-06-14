import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchTutorById, fetchTutorAvailability, createBooking } from '../services/bookingService';

// Icons
const Icons = {
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15 2 5-2-5-5-2 5-2 2-5 2 5 5 2-5 2Z"/><path d="M2 20h.01"/><path d="M7 21h.01"/><path d="M12 22h.01"/><path d="M17 21h.01"/><path d="M22 20h.01"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  BookOpen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatLocalDateTime = (date) => {
  const pad = (v) => String(v).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildNextSlot = (slot) => {
  const now = new Date();
  const candidate = new Date(now);
  const offset = (slot.dayOfWeek - candidate.getDay() + 7) % 7;
  candidate.setDate(candidate.getDate() + offset);

  const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
  const [endHours, endMinutes] = slot.endTime.split(':').map(Number);

  const start = new Date(candidate);
  start.setHours(startHours, startMinutes, 0, 0);

  const end = new Date(candidate);
  end.setHours(endHours, endMinutes, 0, 0);

  if (start <= now) {
    start.setDate(start.getDate() + 7);
    end.setDate(end.getDate() + 7);
  }

  return { start, end };
};

export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tutor, setTutor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ startTime: '', endTime: '', notes: '' });
  const [bookingResult, setBookingResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [tutorData, slots] = await Promise.all([
          fetchTutorById(id),
          fetchTutorAvailability(id),
        ]);
        setTutor(tutorData);
        setAvailability(slots);
      } catch {
        setError('Could not load tutor profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSelectSlot = (slot) => {
    setSelectedSlot(slot);
    const nextSlot = buildNextSlot(slot);
    setForm((prev) => ({
      ...prev,
      startTime: formatLocalDateTime(nextSlot.start),
      endTime: formatLocalDateTime(nextSlot.end),
    }));
    setBookingResult(null);
    setError('');
    // Smooth scroll to booking form
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const booking = await createBooking({
        tutorId: id,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        notes: form.notes,
      });
      setBookingResult(booking);
      setForm({ startTime: '', endTime: '', notes: '' });
      setSelectedSlot(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
      </div>
    );
  }

  if (!tutor) {
    return (
        <div className="mx-auto max-w-2xl py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Tutor Not Found</h2>
            <p className="mt-2 text-slate-600">The tutor profile you're looking for might have been removed or deactivated.</p>
            <Button className="mt-6" onClick={() => navigate('/learner/tutors')}>Back to Search</Button>
        </div>
    );
  }

  const profile = tutor.tutorProfile || {};

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8 animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/learner/tutors')}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all shadow-sm">
                <Icons.ChevronLeft />
            </div>
            Back to Explore
          </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Main Profile Info */}
        <div className="space-y-8">
            <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/50">
                <div className="h-32 bg-gradient-to-r from-slate-900 via-cyan-900 to-slate-800"></div>
                <div className="px-8 pb-10">
                    <div className="relative -mt-16 mb-6 flex items-end justify-between">
                        {tutor.profileImage ? (
                            <img
                            src={tutor.profileImage.startsWith('http') ? tutor.profileImage : `http://localhost:5000/${tutor.profileImage}`}
                            alt={tutor.fullName}
                            className="h-32 w-32 rounded-3xl object-cover border-8 border-white shadow-xl"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-5xl font-black text-white border-8 border-white shadow-xl">
                            {tutor.fullName?.[0]?.toUpperCase() || 'T'}
                            </div>
                        )}
                        <div className="pb-2">
                             {profile.isAvailable ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-emerald-700 border border-emerald-100 shadow-sm">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Active for Bookings
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase text-slate-400 border border-slate-100">
                                    Currently Away
                                </span>
                            )}
                        </div>
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">{tutor.fullName}</h1>
                    <p className="text-xl font-bold text-cyan-600 mb-6 uppercase tracking-wider">{profile.expertise || 'Professional Educator'}</p>
                    
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed italic font-medium">
                            " {tutor.bio || 'Highly dedicated professional committed to delivering personalized learning experiences tailored to each student\'s unique goals.'} "
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</span>
                            <span className="text-xl font-black text-slate-900">LKR {profile.hourlyRate || 'N/A'}</span>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</span>
                            <span className="text-xl font-black text-slate-900">{profile.experience || '0'}+ Yrs</span>
                        </div>
                        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 text-center sm:col-span-2">
                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qualification</span>
                            <span className="text-sm font-bold text-slate-900 truncate block px-2">{profile.qualification || 'Professional Certification'}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Availability */}
            <section className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-200">
                        <Icons.Calendar />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Weekly Availability</h2>
                </div>
                
                {availability.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    {availability.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                        <button
                        key={slot.id}
                        type="button"
                        onClick={() => onSelectSlot(slot)}
                        className={`group relative rounded-[2rem] border-2 p-6 text-left transition-all duration-300 ${
                            isSelected
                            ? 'border-cyan-500 bg-cyan-50 shadow-xl shadow-cyan-100 scale-[1.02]'
                            : 'border-slate-100 bg-white hover:border-cyan-200 hover:shadow-lg hover:shadow-slate-100'
                        }`}
                        >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-cyan-700' : 'text-slate-900'}`}>
                                {DAY_NAMES[slot.dayOfWeek]}
                            </span>
                            {isSelected && <Icons.CheckCircle />}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                            <Icons.Clock />
                            <span>{slot.startTime} â€” {slot.endTime}</span>
                        </div>
                        {isSelected && (
                            <span className="mt-3 inline-block text-[10px] font-black uppercase tracking-widest text-cyan-600 animate-pulse">
                                Selected for Booking
                            </span>
                        )}
                        </button>
                    );
                    })}
                </div>
                ) : (
                <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center bg-slate-50/30">
                    <p className="text-slate-400 font-bold">This tutor hasn't shared their schedule yet.</p>
                </div>
                )}
            </section>

            {/* Tutor Lessons */}
            {tutor.lessons && tutor.lessons.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                            <Icons.BookOpen />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Course Catalogue</h2>
                    </div>
                    <div className="grid gap-4">
                        {tutor.lessons.map((lesson) => (
                        <div key={lesson.id} className="group flex items-center justify-between gap-4 p-6 rounded-[2rem] border-2 border-slate-100 bg-white hover:border-cyan-200 hover:shadow-xl transition-all">
                            <div className="min-w-0">
                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-cyan-600 transition-colors truncate">{lesson.title}</h4>
                                <p className="text-sm text-slate-500 line-clamp-1 mt-1">{lesson.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg text-slate-400 border border-slate-100">{lesson.difficulty}</span>
                                    {lesson.category?.name && <span className="text-[10px] font-black uppercase tracking-widest bg-cyan-50 px-2 py-1 rounded-lg text-cyan-600 border border-cyan-100">{lesson.category.name}</span>}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </section>
            )}
        </div>

        {/* Sidebar: Booking Form */}
        <div className="h-fit sticky top-24">
            <Card id="booking-form" className={`overflow-hidden transition-all duration-500 ${selectedSlot ? 'ring-4 ring-cyan-500/10 scale-[1.02]' : ''}`}>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Secure a Session</h2>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Personalized 1-on-1 mentoring. The tutor will confirm your request shortly.</p>

                {bookingResult ? (
                <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/50 p-6 text-center animate-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-200">
                        <Icons.CheckCircle />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900">Request Sent!</h3>
                    <p className="mt-3 text-sm text-emerald-800/80 leading-relaxed mb-6">
                        We've notified {tutor.fullName}. You can track the status in your dashboard.
                    </p>
                    <div className="space-y-3">
                        <Button className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate('/learner/bookings')}>View Bookings</Button>
                        <button className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline underline-offset-4" onClick={() => setBookingResult(null)}>Book Another</button>
                    </div>
                </div>
                ) : (
                <form className="space-y-6" onSubmit={onBook}>
                    <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Start Time</label>
                        <input
                        type="datetime-local"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        value={form.startTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                        required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">End Time</label>
                        <input
                        type="datetime-local"
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all"
                        value={form.endTime}
                        onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                        required
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Learning Goals / Notes</label>
                    <textarea
                        className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                        rows={4}
                        placeholder="What would you like to focus on during this session?"
                        value={form.notes}
                        onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                    </div>

                    {error && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs font-bold text-rose-600 animate-in shake duration-300">
                        {error}
                    </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-200 flex items-center justify-center gap-3 group"
                    >
                        {submitting ? 'Processing...' : 'Request Session'}
                        {!submitting && <div className="group-hover:translate-x-1 transition-transform"><Icons.ChevronLeft /></div>}
                    </Button>
                </form>
                )}
            </Card>

            <div className="mt-6 p-6 rounded-[2rem] bg-indigo-900 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                <div className="relative z-10">
                    <h4 className="font-black tracking-tight text-xl mb-2">Need Help?</h4>
                    <p className="text-xs text-indigo-300 font-medium leading-relaxed mb-4">Contact our support if you have issues with bookings or payments.</p>
                    <button className="text-[10px] font-black uppercase tracking-widest text-white underline underline-offset-4 hover:text-cyan-300">Open Support Ticket</button>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl"></div>
            </div>
        </div>
      </div>
    </div>
  );
}
