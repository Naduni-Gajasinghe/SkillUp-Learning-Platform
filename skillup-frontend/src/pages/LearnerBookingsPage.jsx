import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cancelBooking, fetchMyBookings } from '../services/bookingService';
import { fetchPaymentHistory, processPayment } from '../services/tutorService';

const STATUS_STYLES = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending — Awaiting tutor response' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed ✓' },
  REJECTED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Rejected' },
  SCHEDULED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Scheduled' },
  COMPLETED: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: 'Completed' },
  CANCELLED: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Cancelled' },
  NO_SHOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'No-show' },
};

export default function LearnerBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentResult, setPaymentResult] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [paymentForm, setPaymentForm] = useState({
    bookingId: '',
    amount: '',
    paymentMethod: 'CARD',
    gateway: 'STRIPE',
    purpose: 'TUTOR_SESSION',
  });

  const load = async () => {
    const [bookingResult, paymentResultData] = await Promise.allSettled([
      fetchMyBookings(),
      fetchPaymentHistory(),
    ]);
    setBookings(bookingResult.status === 'fulfilled' ? bookingResult.value : []);
    setPaymentHistory(paymentResultData.status === 'fulfilled' ? paymentResultData.value : []);
  };

  useEffect(() => {
    load();
  }, []);

  const onCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    await cancelBooking(id, 'Cancelled by learner');
    await load();
  };

  const onPay = async (event) => {
    event.preventDefault();
    const payment = await processPayment({
      ...paymentForm,
      amount: Number(paymentForm.amount),
    });
    setPaymentResult(payment.nextStep || 'Payment submitted');
    setPaymentForm({
      bookingId: '',
      amount: '',
      paymentMethod: 'CARD',
      gateway: 'STRIPE',
      purpose: 'TUTOR_SESSION',
    });
    await load();
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(b.status) && new Date(b.startTime) > now
  );
  const pastBookings = bookings.filter(
    (b) => !['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(b.status) || new Date(b.startTime) <= now
  );
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  // Confirmed bookings without payment — for payment form dropdown
  const payableBookings = bookings.filter(
    (b) => ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(b.status) && (!b.payment || b.payment.status !== 'COMPLETED')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-sm text-slate-600">Track your booking requests, session history, and payments.</p>
        </div>
        <Button onClick={() => navigate('/learner/tutors')}>
          Find a tutor
        </Button>
      </div>

      {/* Booking tabs */}
      <Card>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              activeTab === 'upcoming'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              activeTab === 'past'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {displayedBookings.map((booking) => {
            const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
            return (
              <div key={booking.id} className={`rounded-xl border ${style.border} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.tutor?.fullName || 'Tutor'}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {new Date(booking.startTime).toLocaleString()} –{' '}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </p>
                    {booking.notes && (
                      <p className="mt-1 text-xs text-slate-500">Notes: {booking.notes}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                    {style.label}
                  </span>
                </div>

                {/* Rejection reason */}
                {booking.status === 'REJECTED' && booking.cancellationReason && (
                  <div className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    <strong>Reason:</strong> {booking.cancellationReason}
                  </div>
                )}

                {/* Payment status */}
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-500">
                    Payment: {booking.payment?.status || 'Not paid'}
                  </span>
                  {booking.status === 'PENDING' && (
                    <Button variant="danger" className="text-xs py-1 px-2" onClick={() => onCancel(booking.id)}>
                      Cancel
                    </Button>
                  )}
                  {booking.status === 'REJECTED' && (
                    <Button
                      variant="secondary"
                      className="text-xs py-1 px-2"
                      onClick={() => navigate(`/learner/tutors/${booking.tutorId}`)}
                    >
                      View tutor & rebook
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {displayedBookings.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500">
                {activeTab === 'upcoming' ? 'No upcoming bookings.' : 'No past bookings.'}
              </p>
              {activeTab === 'upcoming' && (
                <Button className="mt-3" onClick={() => navigate('/learner/tutors')}>
                  Find a tutor
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Payment form */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Pay for a session</h2>
        <p className="mt-1 text-sm text-slate-500">
          After a tutor confirms your booking, complete payment to secure your slot.
        </p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onPay}>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={paymentForm.bookingId}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, bookingId: e.target.value }))}
            required
          >
            <option value="">Select booking</option>
            {payableBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.tutor?.fullName || 'Tutor'} · {new Date(booking.startTime).toLocaleString()} · {booking.status}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            step="0.01"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Amount"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
          >
            <option value="CARD">Card</option>
            <option value="WALLET">Wallet</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
          </select>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={paymentForm.gateway}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, gateway: e.target.value }))}
          >
            <option value="STRIPE">Stripe</option>
            <option value="PAYPAL">PayPal</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="MOCK">Mock gateway</option>
          </select>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Pay now</Button>
            {paymentResult ? <p className="text-sm text-slate-600">{paymentResult}</p> : null}
          </div>
        </form>
      </Card>

      {/* Payment history */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
        <div className="mt-3 space-y-3">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{payment.purpose}</p>
              <p className="text-sm text-slate-600">{payment.paymentMethod}</p>
              <p className="text-sm text-slate-700">Amount: LKR {payment.amount}</p>
              {payment.commissionAmount ? <p className="text-xs text-slate-500">Commission: LKR {payment.commissionAmount}</p> : null}
              {payment.tutorEarnings ? <p className="text-xs text-slate-500">Tutor earnings: LKR {payment.tutorEarnings}</p> : null}
              <p className="text-xs text-slate-500">Status: {payment.status}</p>
            </div>
          ))}
          {paymentHistory.length === 0 ? <p className="text-sm text-slate-500">No payments yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
