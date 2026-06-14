import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchBadges, fetchLearnerStats, fetchPoints, fetchProgress, fetchRecommendations } from '../services/learnerService';

const TrophyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const FlameIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
);

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

export default function LearnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [points, setPoints] = useState(null);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [statsResult, pointsResult, progressResult, recommendationResult, badgeResult] = await Promise.allSettled([
          fetchLearnerStats(),
          fetchPoints(),
          fetchProgress(),
          fetchRecommendations(),
          fetchBadges(),
        ]);

        setStats(statsResult.status === 'fulfilled' ? statsResult.value : null);
        setPoints(pointsResult.status === 'fulfilled' ? pointsResult.value : null);
        setProgress(progressResult.status === 'fulfilled' ? progressResult.value : []);
        setRecommendations(recommendationResult.status === 'fulfilled' ? recommendationResult.value : []);
        setBadges(badgeResult.status === 'fulfilled' ? badgeResult.value : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back! Here's what's happening with your learning journey.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-cyan-50 p-3">
              <StarIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Total Points</p>
              <p className="text-2xl font-bold text-slate-900">{points?.points || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-rose-50 p-3">
              <FlameIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Current Streak</p>
              <p className="text-2xl font-bold text-slate-900">{points?.streak || 0} days</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-50 p-3">
              <BookOpenIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completed Lessons</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.activity?.completedLessons || 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-50 p-3">
              <TrophyIcon />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Badges Earned</p>
              <p className="text-2xl font-bold text-slate-900">{stats?.gamification?.badgesEarned || badges.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">Recommended for you</h2>
          </div>
          <div className="p-6">
            {recommendations.length > 0 ? (
              <ul className="space-y-4">
                {recommendations.slice(0, 4).map((item) => (
                  <li key={item.id} className="group relative rounded-xl border border-slate-100 p-4 transition-all hover:border-indigo-200 hover:bg-slate-50">
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-600">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{item.description}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-slate-50 p-4 text-slate-400">
                  <BookOpenIcon />
                </div>
                <p className="mt-4 text-slate-600">No recommendations available yet.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Progress</h2>
          </div>
          <div className="p-6">
            {progress.length > 0 ? (
              <ul className="space-y-4">
                {progress.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{item.lesson?.title}</p>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.lesson?.category?.name} • {item.lesson?.difficulty}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {item.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-slate-50 p-4 text-slate-400">
                  <StarIcon />
                </div>
                <p className="mt-4 text-slate-600">You haven't started any lessons yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
