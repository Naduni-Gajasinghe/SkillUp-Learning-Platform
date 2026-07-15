import { useEffect, useState } from 'react';
import { fetchTutorAnalytics, fetchNotifications, markAllNotificationsRead } from '../services/tutorService';

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-skill-accent"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-skill-dark"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-skill-accentHover"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

export default function TutorDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [analyticsData, notificationData] = await Promise.all([
        fetchTutorAnalytics(),
        fetchNotifications(),
      ]);
      setAnalytics(analyticsData);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Failed to load tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onMarkRead = async () => {
    await markAllNotificationsRead();
    await load();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-skill-border border-t-skill-accent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-skill-dark">Tutor Dashboard</h1>
          <p className="mt-2 text-skill-dark/80">Monitor your performance and manage your notifications.</p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-card border border-skill-border bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-ui bg-[#e6f5ee] p-3">
              <BookIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-skill-dark/75">Total Lessons</p>
              <p className="text-2xl font-bold text-skill-dark">{analytics?.lessonCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-skill-border bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-ui bg-[#ebf0ea] p-3">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-skill-dark/75">Bookings</p>
              <p className="text-2xl font-bold text-skill-dark">{analytics?.totalBookings || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-skill-border bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-ui bg-[#fff5de] p-3">
              <EyeIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-skill-dark/75">Total Views</p>
              <p className="text-2xl font-bold text-skill-dark">{analytics?.totalViews || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-skill-border bg-white p-6 shadow-soft transition-all hover:shadow-card">
          <div className="flex items-center gap-4">
            <div className="rounded-ui bg-[#e6f5ee] p-3">
              <DollarIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-skill-dark/75">Total Earnings</p>
              <p className="text-2xl font-bold text-skill-dark">${analytics?.totalEarnings || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-card border border-skill-border bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between border-b border-skill-border p-6">
          <h2 className="text-lg font-semibold text-skill-dark">Notifications</h2>
          <button 
            className="text-sm font-semibold text-skill-accent hover:text-skill-accentHover transition-colors" 
            onClick={onMarkRead}
          >
            Mark all as read
          </button>
        </div>

        <div className="p-6">
          {notifications.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <li key={notification.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex gap-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-skill-accent shrink-0"></div>
                    <div className="space-y-1">
                      <p className="font-semibold text-skill-dark">{notification.title}</p>
                      <p className="text-sm text-skill-dark/80">{notification.message}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-[#edf3ef] p-4 text-skill-dark/50">
                <BellIcon />
              </div>
              <p className="mt-4 text-skill-dark/80 font-medium">No new notifications</p>
              <p className="text-sm text-skill-dark/60">We'll let you know when something important happens.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
