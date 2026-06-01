import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchMyBookings, updateBookingStatus } from '../services/bookingService';

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState([]);

  const load = async () => {
    const data = await fetchMyBookings();
    setBookings(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onUpdateStatus = async (bookingId, status) => {
    let reason;
    if (status === 'CANCELLED') {
      reason = window.prompt('Enter cancellation reason (optional):');
    }
    await updateBookingStatus(bookingId, status, reason);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tutor Bookings</h1>

      <Card>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">Learner: {booking.learner?.fullName}</p>
              <p className="text-sm text-slate-600">
                {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-slate-500">Current status: {booking.status}</p>
              <p className="text-xs text-slate-500">Payment: {booking.payment?.status || 'Not paid'}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {booking.status === 'PENDING' ? (
                  <>
                    <Button variant="primary" onClick={() => onUpdateStatus(booking.id, 'CONFIRMED')}>
                      Accept
                    </Button>
                    <Button variant="secondary" onClick={() => onUpdateStatus(booking.id, 'REJECTED')}>
                      Reject
                    </Button>
                  </>
                ) : null}
                {booking.status === 'CONFIRMED' ? (
                  <>
                    <Button variant="secondary" onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}>
                      Mark completed
                    </Button>
                    <Button variant="danger" onClick={() => onUpdateStatus(booking.id, 'NO_SHOW')}>
                      No-show
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-slate-500">No bookings found.</p> : null}
        </div>
      </Card>
    </div>
  );
}
