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
        <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
        <div className="mt-3 overflow-x-auto text-sm text-slate-700">
          <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-xl">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Tutor earnings</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{payment.user?.fullName || payment.user?.email || '-'}</td>
                  <td className="px-4 py-3">{payment.purpose}</td>
                  <td className="px-4 py-3">{payment.amount}</td>
                  <td className="px-4 py-3">{payment.tutorEarnings ?? '-'}</td>
                  <td className="px-4 py-3">{payment.commissionAmount ?? '-'}</td>
                  <td className="px-4 py-3">{payment.status}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No payment history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
