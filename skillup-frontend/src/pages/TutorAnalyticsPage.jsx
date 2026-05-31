import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchPaymentHistory, fetchTutorAnalytics } from '../services/tutorService';

export default function TutorAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [analyticsData, paymentData] = await Promise.all([
        fetchTutorAnalytics(),
        fetchPaymentHistory(),
      ]);
      setAnalytics(analyticsData);
      setPayments(paymentData);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tutor Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Lessons" value={analytics?.lessonCount || 0} tone="cyan" />
        <StatCard label="Bookings" value={analytics?.totalBookings || 0} tone="amber" />
        <StatCard label="Views" value={analytics?.totalViews || 0} />
        <StatCard label="Earnings" value={analytics?.totalEarnings || 0} tone="emerald" />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Payment history (Mock module)</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{payment.purpose}</p>
              <p>Amount: {payment.amount}</p>
              <p>Status: {payment.status}</p>
            </div>
          ))}
          {payments.length === 0 ? <p className="text-slate-500">No payment history yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
