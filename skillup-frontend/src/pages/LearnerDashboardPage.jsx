import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchBadges, fetchLearnerStats, fetchPoints, fetchProgress, fetchRecommendations } from '../services/learnerService';

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
        const [statsData, pointsData, progressData, recommendationData, badgeData] = await Promise.all([
          fetchLearnerStats(),
          fetchPoints(),
          fetchProgress(),
          fetchRecommendations(),
          fetchBadges(),
        ]);

        setStats(statsData);
        setPoints(pointsData);
        setProgress(progressData);
        setRecommendations(recommendationData);
        setBadges(badgeData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Learner Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total points" value={points?.points || 0} tone="cyan" />
        <StatCard label="Current streak" value={points?.streak || 0} tone="amber" />
        <StatCard label="Completed lessons" value={stats?.activity?.completedLessons || 0} tone="emerald" />
        <StatCard label="Badges earned" value={stats?.gamification?.badgesEarned || badges.length || 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Recommended for you</h2>
          {loading ? <p className="mt-3 text-sm text-slate-500">Loading recommendations...</p> : null}
          <ul className="mt-3 space-y-3">
            {recommendations.slice(0, 4).map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </li>
            ))}
            {!loading && recommendations.length === 0 ? (
              <li className="text-sm text-slate-500">No recommendations yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Recent progress</h2>
          <ul className="mt-3 space-y-3">
            {progress.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-900">{item.lesson?.title}</p>
                  <p className="text-xs text-slate-500">{item.lesson?.category?.name} · {item.lesson?.difficulty}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.isCompleted ? 'Completed' : 'In Progress'}
                </span>
              </li>
            ))}
            {progress.length === 0 ? <li className="text-sm text-slate-500">No progress yet.</li> : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
