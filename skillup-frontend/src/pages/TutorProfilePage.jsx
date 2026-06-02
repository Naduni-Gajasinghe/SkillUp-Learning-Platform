import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchTutorById, fetchTutorAvailability, createBooking } from '../services/bookingService';

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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <Card>
        <p className="text-center text-slate-600">Tutor not found.</p>
        <div className="mt-4 text-center">
          <Button onClick={() => navigate('/learner/tutors')}>Back to search</Button>
        </div>
      </Card>
    );
  }

  const profile = tutor.tutorProfile || {};

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/learner/tutors')}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-cyan-700 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tutors
      </button>

      {/* Profile header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {tutor.profileImage ? (
            <img
              src={tutor.profileImage.startsWith('http') ? tutor.profileImage : `http://localhost:5000/${tutor.profileImage}`}
              alt={tutor.fullName}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-slate-100"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-100 text-2xl font-bold text-cyan-700">
              {tutor.fullName?.[0]?.toUpperCase() || 'T'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{tutor.fullName}</h1>
                {profile.expertise && (
                  <p className="mt-0.5 text-sm text-slate-600">{profile.expertise}</p>
                )}
              </div>
              {profile.isAvailable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  Unavailable
                </span>
              )}
            </div>
            {tutor.bio && <p className="mt-2 text-sm text-slate-600">{tutor.bio}</p>}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
              {profile.hourlyRate != null && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">Rate</span>
                  <p className="font-semibold">LKR {profile.hourlyRate}/hr</p>
                </div>
              )}
              {profile.experience != null && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">Experience</span>
                  <p className="font-semibold">{profile.experience} years</p>
                </div>
              )}
              {profile.qualification && (
                <div>
                  <span className="text-xs uppercase tracking-wide text-slate-400">Qualification</span>
                  <p className="font-semibold">{profile.qualification}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Availability slots */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Available Time Slots</h2>
        <p className="mt-1 text-sm text-slate-500">Click a slot to pre-fill the booking form below.</p>
        {availability.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {availability.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/20'
                      : 'border-slate-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/50'
                  }`}
                >
                  <span className="block font-semibold text-slate-900">
                    {DAY_NAMES[slot.dayOfWeek]}
                  </span>
                  <span className="text-slate-600">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  {isSelected && (
                    <span className="mt-1 block text-xs font-medium text-cyan-600">
                      ✓ Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">This tutor has no availability slots configured.</p>
        )}
      </Card>

      {/* Booking form */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Book a Session</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select a time slot above or manually enter your preferred time. The tutor will review your request.
        </p>

        {bookingResult ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">Booking request submitted!</p>
            <p className="mt-1 text-sm text-emerald-700">
              Your booking is now <strong>PENDING</strong>. The tutor will review and accept or reject your request.
              You'll receive a notification once they respond.
            </p>
            {bookingResult.sessionFee != null && (
              <p className="mt-2 text-sm text-emerald-700">
                Estimated session fee: <strong>LKR {bookingResult.sessionFee}</strong>
              </p>
            )}
            <div className="mt-3 flex gap-2">
              <Button onClick={() => setBookingResult(null)}>Book another session</Button>
              <Button variant="secondary" onClick={() => navigate('/learner/bookings')}>
                View my bookings
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={onBook}>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Start time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">End time</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Notes (optional)</label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                rows={3}
                placeholder="Anything you'd like the tutor to know about this session..."
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit booking request'}
            </Button>
          </form>
        )}
      </Card>

      {/* Tutor's lessons */}
      {tutor.lessons && tutor.lessons.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Lessons by this tutor</h2>
          <div className="mt-3 space-y-2">
            {tutor.lessons.map((lesson) => (
              <div key={lesson.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{lesson.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{lesson.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                      {lesson.difficulty}
                    </span>
                    {lesson.isPremium && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
                {lesson.category?.name && (
                  <span className="mt-2 inline-block rounded bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700">
                    {lesson.category.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
