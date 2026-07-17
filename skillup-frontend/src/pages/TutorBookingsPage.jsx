import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchMyBookings, updateBookingStatus } from '../services/bookingService';

const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Mail: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  MessageSquare: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
};

const STATUS_STYLES = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending Review' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
  REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Scheduled' },
  COMPLETED: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'Completed' },
  CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', label: 'No-show' },
};

export default function TutorBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, bookingId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false, bookingId: null, zoomLink: '' });
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
    setConfirmModal({ open: true, bookingId, zoomLink: '' });
  };

  const onConfirmAccept = async () => {
    await updateBookingStatus(confirmModal.bookingId, 'CONFIRMED', undefined, confirmModal.zoomLink || undefined);
    setConfirmModal({ open: false, bookingId: null, zoomLink: '' });
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
      <div key={booking.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="shrink-0">
                {booking.learner?.profileImage ? (
                <img
                  src={booking.learner.profileImage.startsWith('http') ? booking.learner.profileImage : `http://localhost:5000${booking.learner.profileImage.startsWith('/') ? '' : '/'}${booking.learner.profileImage}`}
                  alt={booking.learner.fullName}
                  className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                />
                ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-bold text-cyan-700 border border-cyan-200">
                    {booking.learner?.fullName?.[0]?.toUpperCase() || 'L'}
                </div>
                )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none mb-1 group-hover:text-cyan-700 transition-colors">
                  {booking.learner?.fullName || 'Learner'}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <Icons.Mail />
                <span>{booking.learner?.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Icons.Calendar />
                  <span className="text-sm font-semibold text-slate-700">
                    {new Date(booking.startTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
              </div>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase border ${style.bg} ${style.text} ${style.border}`}>
            {style.label}
          </span>
        </div>

        {booking.notes && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
                <Icons.MessageSquare />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learner Notes</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic">" {booking.notes} "</p>
          </div>
        )}

        {booking.cancellationReason && ['REJECTED', 'CANCELLED'].includes(booking.status) && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100">
            <strong>Reason for cancellation:</strong> {booking.cancellationReason}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${booking.payment?.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Payment Status: {booking.payment?.status || 'Pending'}
                </span>
            </div>

            {showActions && (
            <div className="flex gap-2">
                {booking.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => onAccept(booking.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all shadow-md shadow-emerald-100"
                    >
                        <Icons.Check />
                        Accept Request
                    </button>
                    <button 
                        onClick={() => onReject(booking.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-all"
                    >
                        <Icons.X />
                        Reject
                    </button>
                </>
                )}
                {booking.status === 'CONFIRMED' && (
                <>
                    <button 
                        onClick={() => onUpdateStatus(booking.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200"
                    >
                        Mark Completed
                    </button>
                    <button 
                        onClick={() => onUpdateStatus(booking.id, 'NO_SHOW')}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-all"
                    >
                        No-show
                    </button>
                </>
                )}
            </div>
            )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Booking Management</h1>
        <p className="mt-2 text-slate-600 max-w-2xl text-lg font-medium leading-relaxed">Review incoming requests and manage your scheduled teaching sessions.</p>
      </header>

      {/* Pending requests - Primary Focus */}
      {pendingBookings.length > 0 ? (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white font-black shadow-lg shadow-amber-200">
                {pendingBookings.length}
                </div>
                <h2 className="text-2xl font-bold text-slate-900">New Requests</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
                {pendingBookings.map((b) => renderBookingCard(b, true))}
            </div>
        </section>
      ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/30">
              <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
                  <Icons.User />
              </div>
              <p className="text-lg font-bold text-slate-400">No new booking requests at the moment.</p>
          </div>
      )}

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Upcoming sessions */}
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-cyan-500 pl-4">Upcoming Sessions</h2>
            <div className="space-y-4">
                {confirmedBookings.length > 0 ? (
                    confirmedBookings.map((b) => renderBookingCard(b, true))
                ) : (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-sm font-medium">
                        No upcoming sessions scheduled.
                    </div>
                )}
            </div>
        </section>

        {/* Past sessions */}
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-l-4 border-slate-300 pl-4">Past Sessions</h2>
            <div className="space-y-4">
                {pastBookings.length > 0 ? (
                    pastBookings.map((b) => renderBookingCard(b, false))
                ) : (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-sm font-medium">
                        Your session history is clear.
                    </div>
                )}
            </div>
        </section>
      </div>

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                <Icons.X />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Reject Request?</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              We recommend providing a brief reason to help the learner understand and rebook for a better time.
            </p>
            <textarea
              className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 placeholder:text-slate-400"
              rows={4}
              placeholder="E.g., I'm unavailable at this specific time, please try Monday..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-8 flex gap-3">
              <button
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setRejectModal({ open: false, bookingId: null })}
              >
                Go Back
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
                onClick={onConfirmReject}
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Modal (optional Zoom link) */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Icons.Check />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Confirm Booking</h3>
            <p className="mt-2 text-slate-600 leading-relaxed">Optionally add a Zoom link for this session. Learner will receive it with the confirmation.</p>
            <input
              type="url"
              placeholder="https://zoom.us/j/xxxxxxxxxx"
              value={confirmModal.zoomLink}
              onChange={(e) => setConfirmModal((prev) => ({ ...prev, zoomLink: e.target.value }))}
              className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="mt-8 flex gap-3">
              <button
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setConfirmModal({ open: false, bookingId: null, zoomLink: '' })}
              >
                Cancel
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                onClick={onConfirmAccept}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
