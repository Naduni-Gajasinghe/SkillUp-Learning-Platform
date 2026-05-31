import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cancelBooking, createBooking, fetchMyBookings, fetchTutors } from '../services/bookingService';

export default function LearnerBookingsPage() {
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ tutorId: '', startTime: '', endTime: '', notes: '' });

  const load = async () => {
    const [tutorData, bookingData] = await Promise.all([fetchTutors(), fetchMyBookings()]);
    setTutors(tutorData);
    setBookings(bookingData);
  };

  useEffect(() => {
    load();
  }, []);

  const onBook = async (event) => {
    event.preventDefault();
    await createBooking(form);
    setForm({ tutorId: '', startTime: '', endTime: '', notes: '' });
    await load();
  };

  const onCancel = async (id) => {
    await cancelBooking(id, 'Cancelled by learner');
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Book a tutor session</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onBook}>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.tutorId}
            onChange={(e) => setForm((prev) => ({ ...prev, tutorId: e.target.value }))}
            required
          >
            <option value="">Select tutor</option>
            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>{tutor.fullName}</option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
            required
          />
          <input
            type="datetime-local"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          />
          <div className="md:col-span-2">
            <Button type="submit">Book session</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">My booking history</h2>
        <div className="mt-3 space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">Tutor: {booking.tutor?.fullName}</p>
              <p className="text-sm text-slate-600">
                {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Status: {booking.status}</p>
              {booking.status === 'SCHEDULED' ? (
                <Button className="mt-2" variant="danger" onClick={() => onCancel(booking.id)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-slate-500">No bookings yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
