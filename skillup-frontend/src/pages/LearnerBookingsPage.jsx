import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cancelBooking, fetchMyBookings } from '../services/bookingService';
import { fetchPaymentHistory, processPayment } from '../services/tutorService';

// Icons
const Icons = {
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  CreditCard: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
};

const STATUS_STYLES = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' },
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Confirmed' },
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
  const [loading, setLoading] = useState(true);
  const [paymentForm, setPaymentForm] = useState({
    bookingId: '',
    amount: '',
    paymentMethod: 'CARD',
    gateway: 'STRIPE',
    purpose: 'TUTOR_SESSION',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [bookingResult, paymentResultData] = await Promise.allSettled([
        fetchMyBookings(),
        fetchPaymentHistory(),
      ]);
      setBookings(bookingResult.status === 'fulfilled' ? bookingResult.value : []);
      setPaymentHistory(paymentResultData.status === 'fulfilled' ? paymentResultData.value : []);
    } finally {
      setLoading(false);
    }
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

  const payableBookings = bookings.filter(
    (b) => ['PENDING', 'CONFIRMED', 'SCHEDULED'].includes(b.status) && (!b.payment || b.payment.status !== 'COMPLETED')
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Bookings</h1>
          <p className="mt-1 text-slate-600">Manage your learning sessions and payments.</p>
        </div>
        <Button onClick={() => navigate('/learner/tutors')} className="h-fit">
          Book New Session
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Booking list */}
          <Card className="overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Upcoming Sessions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('past')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === 'past'
                    ? 'bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Past History
              </button>
            </div>

            <div className="p-6 space-y-4">
              {displayedBookings.length > 0 ? (
                displayedBookings.map((booking) => {
                  const style = STATUS_STYLES[booking.status] || STATUS_STYLES.PENDING;
                  return (
                    <div key={booking.id} className="group rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-md hover:shadow-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 font-bold border border-cyan-100 uppercase">
                                {booking.tutor?.fullName?.[0] || 'T'}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                                    {booking.tutor?.fullName || 'Tutor'}
                                </h3>
                                <div className="mt-1 flex flex-col gap-1 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Calendar />
                                        {new Date(booking.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Clock />
                                        {new Date(booking.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - {new Date(booking.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${style.bg} ${style.text} border ${style.border}`}>
                            {style.label}
                        </span>
                      </div>

                      {booking.notes && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 italic border border-slate-100">
                          " {booking.notes} "
                        </div>
                      )}

                      {booking.zoomLink && (
                        <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 border border-emerald-100">
                          <strong className="block text-xs font-bold mb-1">Zoom Link</strong>
                          <a href={booking.zoomLink} target="_blank" rel="noreferrer" className="text-sm underline">
                            Join session
                          </a>
                        </div>
                      )}

                      <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${booking.payment?.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Payment: {booking.payment?.status || 'Unpaid'}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            {booking.status === 'PENDING' && (
                                <button 
                                    onClick={() => onCancel(booking.id)}
                                    className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                                >
                                    Cancel Booking
                                </button>
                            )}
                            {booking.status === 'REJECTED' && (
                                <button 
                                    onClick={() => navigate(`/learner/tutors/${booking.tutorId}`)}
                                    className="text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-50 p-6 text-slate-300 mb-4">
                    <Icons.Calendar />
                  </div>
                  <p className="text-slate-500 font-medium">
                    {activeTab === 'upcoming' ? 'No sessions scheduled yet.' : 'Your session history is empty.'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <Button variant="secondary" className="mt-4" onClick={() => navigate('/learner/tutors')}>
                      Browse Tutors
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Payment card */}
          <Card className="bg-white border-2 border-slate-200 shadow-xl shadow-slate-200/50 p-6">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-2 text-slate-900">
                <Icons.CreditCard />
                Quick Payment
            </h2>
            <p className="text-slate-500 text-xs mb-6 font-medium">Complete payment for your confirmed sessions.</p>
            
            <form className="space-y-4" onSubmit={onPay}>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Select Session</label>
                <select
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                    value={paymentForm.bookingId}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, bookingId: e.target.value }))}
                    required
                >
                    <option value="">Choose a booking...</option>
                    {payableBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                        {booking.tutor?.fullName} · {new Date(booking.startTime).toLocaleDateString()}
                    </option>
                    ))}
                    {payableBookings.length === 0 && (
                        <option disabled>No sessions available</option>
                    )}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Amount (LKR)</label>
                <input
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-400"
                    placeholder="Enter amount"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
                    required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Method</label>
                    <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-xs text-slate-900 focus:outline-none transition-all cursor-pointer"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                        <option value="CARD">Card</option>
                        <option value="WALLET">Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Gateway</label>
                    <select
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-3 text-xs text-slate-900 focus:outline-none transition-all cursor-pointer"
                        value={paymentForm.gateway}
                        onChange={(e) => setPaymentForm((prev) => ({ ...prev, gateway: e.target.value }))}
                    >
                        <option value="STRIPE">Stripe</option>
                        <option value="PAYPAL">PayPal</option>
                        <option value="MOCK">Mock</option>
                    </select>
                  </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white border-none mt-4 font-bold shadow-lg shadow-slate-200 transition-all active:scale-[0.98]">
                Complete Payment
              </Button>
              {paymentResult && (
                  <div className="mt-4 p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold text-center uppercase tracking-widest animate-pulse">
                    {paymentResult}
                  </div>
              )}
            </form>
          </Card>

          {/* Mini History */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Icons.History />
                    Recent Activity
                </h3>
            </div>
            <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto">
                {paymentHistory.map((payment) => (
                    <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                            <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{payment.purpose}</p>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">LKR {payment.amount}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <p className="text-slate-400 font-medium">{payment.paymentMethod} • {payment.status}</p>
                            <p className="text-slate-400">{new Date(payment.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}
                {paymentHistory.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">No payment activity.</div>
                )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
