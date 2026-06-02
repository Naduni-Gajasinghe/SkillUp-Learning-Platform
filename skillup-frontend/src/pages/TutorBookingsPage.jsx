import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchMyBookings, updateBookingStatus } from '../services/bookingService';

const STATUS_STYLES = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
  REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Scheduled' },
  COMPLETED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Completed' },
  CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'No-show' },
};

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAccept = async (bookingId) => {
    await updateBookingStatus(bookingId, 'CONFIRMED');
    await load();
  };

  const onReject = (bookingId) => {
    setRejectModal({ open: true, bookingId });
    setRejectReason('');
  };

  const onConfirmReject = async () => {
    await updateBookingStatus(rejectModal.bookingId, 'REJECTED', rejectReason || undefined);
    setRejectModal({ open: false, bookingId: null });
    setRejectReason('');
    await load();
  };

  const onUpdateStatus = async (bookingId, status) => {
    await updateBookingStatus(bookingId, status);
    await load();
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const confirmedBookings = bookings.filter((b) => ['CONFIRMED', 'SCHEDULED'].includes(b.status));
  const pastBookings = bookings.filter((b) => ['COMPLETED', 'CANCELLED', 'REJECTED', 'NO_SHOW'].includes(b.status));

  const renderBookingCard = (booking, showActions = false) => {
    const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
    return (
      <div key={booking.id} className={`rounded-xl border ${style.border} p-4`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {booking.learner?.profileImage ? (
              <img
                src={booking.learner.profileImage.startsWith('http') ? booking.learner.profileImage : `http://localhost:5000/${booking.learner.profileImage}`}
                alt={booking.learner.fullName}
                className="h-10 w-10 rounded-full object-cover border border-slate-100"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                {booking.learner?.fullName?.[0]?.toUpperCase() || 'L'}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900">{booking.learner?.fullName || 'Learner'}</p>
              {booking.learner?.email && (
                <p className="text-xs text-slate-500">{booking.learner.email}</p>
              )}
              <p className="mt-0.5 text-sm text-slate-600">
                {new Date(booking.startTime).toLocaleString()} –{' '}
                {new Date(booking.endTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>

        {/* Notes from learner */}
        {booking.notes && (
          <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <span className="text-xs font-medium text-slate-400 uppercase">Learner notes:</span>
            <p className="mt-0.5">{booking.notes}</p>
          </div>
        )}

        {/* Cancellation/rejection reason */}
        {booking.cancellationReason && ['REJECTED', 'CANCELLED'].includes(booking.status) && (
          <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            <strong>Reason:</strong> {booking.cancellationReason}
          </div>
        )}

        {/* Payment info */}
        <p className="mt-2 text-xs text-slate-500">Payment: {booking.payment?.status || 'Not paid'}</p>

        {/* Actions */}
        {showActions && (
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.status === 'PENDING' && (
              <>
                <Button variant="primary" onClick={() => onAccept(booking.id)}>
                  Accept
                </Button>
                <Button variant="danger" onClick={() => onReject(booking.id)}>
                  Reject
                </Button>
              </>
            )}
            {booking.status === 'CONFIRMED' && (
              <>
                <Button variant="secondary" onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}>
                  Mark completed
                </Button>
                <Button variant="danger" onClick={() => onUpdateStatus(booking.id, 'NO_SHOW')}>
                  No-show
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tutor Bookings</h1>
        <p className="text-sm text-slate-600">Review and manage booking requests from learners.</p>
      </div>

      {/* Pending requests — highlighted */}
      {pendingBookings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pendingBookings.length}
            </span>
            <h2 className="text-lg font-semibold text-slate-900">Pending Requests</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">These learners are waiting for your response.</p>
          <div className="mt-4 space-y-3">
            {pendingBookings.map((b) => renderBookingCard(b, true))}
          </div>
        </Card>
      )}

      {/* Upcoming sessions */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h2>
        <div className="mt-3 space-y-3">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((b) => renderBookingCard(b, true))
          ) : (
            <p className="text-sm text-slate-500">No upcoming sessions.</p>
          )}
        </div>
      </Card>

      {/* Past sessions */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Past Sessions</h2>
        <div className="mt-3 space-y-3">
          {pastBookings.length > 0 ? (
            pastBookings.map((b) => renderBookingCard(b, false))
          ) : (
            <p className="text-sm text-slate-500">No past sessions.</p>
          )}
        </div>
      </Card>

      {/* Rejection reason modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Reject Booking</h3>
            <p className="mt-1 text-sm text-slate-600">
              Provide a reason so the learner knows why and can find an alternative slot.
            </p>
            <textarea
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              rows={3}
              placeholder="Reason for rejection (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setRejectModal({ open: false, bookingId: null })}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirmReject}>
                Reject booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
