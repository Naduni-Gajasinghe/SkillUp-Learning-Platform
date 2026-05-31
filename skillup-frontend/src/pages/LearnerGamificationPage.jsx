import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchAchievements, fetchBadges, fetchLeaderboard, fetchPoints } from '../services/learnerService';

export default function LearnerGamificationPage() {
  const [points, setPoints] = useState(null);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [pointsData, badgesData, achievementsData, leaderboardData] = await Promise.all([
        fetchPoints(),
        fetchBadges(),
        fetchAchievements(),
        fetchLeaderboard(10),
      ]);

      setPoints(pointsData);
      setBadges(badgesData);
      setAchievements(achievementsData);
      setLeaderboard(leaderboardData);
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Gamification</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Points" value={points?.points || 0} tone="cyan" />
        <StatCard label="Streak" value={points?.streak || 0} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Badges</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {badges.map((badge) => <li key={badge.id}>{badge.badge?.name || badge.name}</li>)}
            {badges.length === 0 ? <li className="text-slate-500">No badges yet.</li> : null}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {achievements.map((achievement) => <li key={achievement.id}>{achievement.achievement?.name || achievement.name}</li>)}
            {achievements.length === 0 ? <li className="text-slate-500">No achievements yet.</li> : null}
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Leaderboard</h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-700">
            {leaderboard.map((item, index) => (
              <li key={item.userId || index} className="flex items-center justify-between">
                <span>{index + 1}. {item.user?.fullName || item.fullName || 'Learner'}</span>
                <span className="font-semibold">{item.points}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  );
}
