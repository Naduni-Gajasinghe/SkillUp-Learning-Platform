import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchTutorAnalytics, fetchNotifications, markAllNotificationsRead } from '../services/tutorService';

export default function TutorDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    const [analyticsData, notificationData] = await Promise.all([
      fetchTutorAnalytics(),
      fetchNotifications(),
    ]);
    setAnalytics(analyticsData);
    setNotifications(notificationData);
  };

  useEffect(() => {
    load();
  }, []);

  const onMarkRead = async () => {
    await markAllNotificationsRead();
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tutor Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total lessons" value={analytics?.lessonCount || 0} tone="cyan" />
        <StatCard label="Bookings" value={analytics?.totalBookings || 0} />
        <StatCard label="Views" value={analytics?.totalViews || 0} tone="amber" />
        <StatCard label="Earnings" value={analytics?.totalEarnings || 0} tone="emerald" />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
          <button className="text-sm font-semibold text-cyan-700" onClick={onMarkRead}>Mark all as read</button>
        </div>

        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{notification.title}</p>
              <p>{notification.message}</p>
            </li>
          ))}
          {notifications.length === 0 ? <li className="text-slate-500">No notifications yet.</li> : null}
        </ul>
      </Card>
    </div>
  );
}
