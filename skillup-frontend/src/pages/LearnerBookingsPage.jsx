import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cancelBooking, createBooking, fetchMyBookings, fetchTutors, fetchTutorAvailability } from '../services/bookingService';
import { fetchPaymentHistory, processPayment } from '../services/tutorService';

const formatLocalDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0');
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

export default function LearnerBookingsPage() {
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState('');
  const [form, setForm] = useState({ tutorId: '', startTime: '', endTime: '', notes: '' });
  const [paymentForm, setPaymentForm] = useState({
    bookingId: '',
    amount: '',
    paymentMethod: 'CARD',
    gateway: 'STRIPE',
    purpose: 'TUTOR_SESSION',
  });

  const selectableTutors = useMemo(() => {
    const approvedTutors = tutors.filter((tutor) => tutor.verificationStatus === 'APPROVED');
    return approvedTutors.length > 0 ? approvedTutors : tutors;
  }, [tutors]);

  const getTutorLabel = (tutor) => {
    if (!tutor) return 'Tutor';

    const name = tutor.fullName || tutor.name || tutor.user?.fullName || tutor.user?.name;
    const expertise = tutor.tutorProfile?.expertise || tutor.expertise;

    if (name && expertise) return `${name} · ${expertise}`;
    return name || expertise || 'Tutor';
  };

  const load = async () => {
    const [tutorResult, bookingResult, paymentResultData] = await Promise.allSettled([
      fetchTutors(),
      fetchMyBookings(),
      fetchPaymentHistory(),
    ]);

    setTutors(tutorResult.status === 'fulfilled' ? tutorResult.value : []);
    setBookings(bookingResult.status === 'fulfilled' ? bookingResult.value : []);
    setPaymentHistory(paymentResultData.status === 'fulfilled' ? paymentResultData.value : []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!form.tutorId) {
        setAvailability([]);
        return;
      }

      try {
        setAvailabilityLoading(true);
        const slots = await fetchTutorAvailability(form.tutorId);
        setAvailability(slots);
      } catch (error) {
        setAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [form.tutorId]);

  const onBook = async (event) => {
    event.preventDefault();
    const booking = await createBooking({
      ...form,
      tutorId: form.tutorId,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
    });
    setForm({ tutorId: '', startTime: '', endTime: '', notes: '' });
    setPaymentForm((prev) => ({
      ...prev,
      bookingId: booking.id,
      amount: booking.sessionFee?.toString() || '',
    }));
    setPaymentResult('Booking request created. Complete payment to keep the tutor slot reserved.');
    await load();
  };

  const onCancel = async (id) => {
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

  const onUseSlot = (slot) => {
    const nextSlot = buildNextSlot(slot);
    setForm((prev) => ({
      ...prev,
      startTime: formatLocalDateTime(nextSlot.start),
      endTime: formatLocalDateTime(nextSlot.end),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-600">Book tutor sessions, pay through a gateway, and track session history.</p>
      </div>

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
            {selectableTutors.map((tutor) => (
              <option key={tutor.userId || tutor.user?.id} value={tutor.userId || tutor.user?.id}>
                {getTutorLabel(tutor)}
                {tutor.verificationStatus ? ` (${tutor.verificationStatus.toLowerCase()})` : ''}
              </option>
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
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Tutor availability</h3>
            {availabilityLoading ? <span className="text-xs text-slate-500">Loading slots...</span> : null}
          </div>
          {availability.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {availability.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  className="rounded-lg border border-cyan-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-400 hover:bg-cyan-50"
                  onClick={() => onUseSlot(slot)}
                >
                  <span className="block font-semibold text-slate-900">Day {slot.dayOfWeek}</span>
                  <span>{slot.startTime} - {slot.endTime}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Select a tutor to see their recurring availability.</p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Pay for a live session</h2>
        <p className="mt-1 text-sm text-slate-500">Choose a gateway and connect the payment to a booking when the tutor session is ready.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onPay}>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={paymentForm.bookingId}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, bookingId: e.target.value }))}
            required
          >
            <option value="">Select booking</option>
            {bookings.map((booking) => (
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
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Purpose"
            value={paymentForm.purpose}
            onChange={(e) => setPaymentForm((prev) => ({ ...prev, purpose: e.target.value }))}
          />
          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit">Pay now</Button>
            {paymentResult ? <p className="text-sm text-slate-600">{paymentResult}</p> : null}
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
              <p className="text-xs text-slate-500">Payment: {booking.payment?.status || 'Not paid'}</p>
              {booking.status === 'PENDING' ? (
                <Button className="mt-2" variant="danger" onClick={() => onCancel(booking.id)}>
                  Cancel
                </Button>
              ) : null}
            </div>
          ))}
          {bookings.length === 0 ? <p className="text-sm text-slate-500">No bookings yet.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
        <div className="mt-3 space-y-3">
          {paymentHistory.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{payment.purpose}</p>
              <p className="text-sm text-slate-600">{payment.paymentMethod}</p>
              <p className="text-sm text-slate-700">Amount: {payment.amount}</p>
              {payment.commissionAmount ? <p className="text-xs text-slate-500">Commission: {payment.commissionAmount}</p> : null}
              {payment.tutorEarnings ? <p className="text-xs text-slate-500">Tutor earnings: {payment.tutorEarnings}</p> : null}
              <p className="text-xs text-slate-500">Status: {payment.status}</p>
            </div>
          ))}
          {paymentHistory.length === 0 ? <p className="text-sm text-slate-500">No payments yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
