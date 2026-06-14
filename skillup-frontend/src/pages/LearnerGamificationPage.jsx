import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import { fetchAchievements, fetchBadges, fetchLeaderboard, fetchPoints } from '../services/learnerService';

// Icons
const Icons = {
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15 2 5-2-5-5-2 5-2 2-5 2 5 5 2-5 2Z"/><path d="M2 20h.01"/><path d="M7 21h.01"/><path d="M12 22h.01"/><path d="M17 21h.01"/><path d="M22 20h.01"/></svg>
  ),
  Trophy: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
};

export default function LearnerGamificationPage() {
  const [points, setPoints] = useState(null);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
      return (
          <div className="flex h-96 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
          </div>
      );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Your Rewards</h1>
        <p className="text-lg text-slate-600 font-medium">Keep learning to earn points, unlock badges, and climb the leaderboard.</p>
      </header>

      {/* Hero Stats */}
      <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-slate-200">
              <div className="relative z-10 flex items-center justify-between">
                  <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2 block">Total Skill Points</span>
                      <p className="text-6xl font-black">{points?.points || 0}</p>
                  </div>
                  <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center text-cyan-400">
                      <Icons.Zap />
                  </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-cyan-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-amber-500 to-orange-600 p-8 text-white shadow-2xl shadow-amber-100">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2 block">Current Streak</span>
                        <p className="text-6xl font-black">{points?.streak || 0}</p>
                        <span className="text-sm font-bold mt-1 block">Days in a row! 🔥</span>
                    </div>
                    <div className="h-20 w-20 rounded-3xl bg-white/20 flex items-center justify-center text-white">
                        <Icons.Target />
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-white/20 rounded-full blur-3xl"></div>
          </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Badges Section */}
        <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Icons.Award />
                </div>
                Badges
            </h2>
            <div className="grid gap-4">
                {badges.length > 0 ? (
                    badges.map((badge) => (
                        <div key={badge.id} className="group flex items-center gap-4 p-5 rounded-3xl border-2 border-slate-100 bg-white hover:border-cyan-200 transition-all shadow-sm">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🎖️
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{badge.badge?.name || badge.name}</p>
                                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Unlocked Access</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 rounded-[2rem] border-2 border-dashed border-slate-200 text-center bg-slate-50/30">
                        <p className="text-slate-400 font-bold text-sm">No badges yet. Start a lesson to earn your first!</p>
                    </div>
                )}
            </div>
        </section>

        {/* Achievements Section */}
        <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Icons.Target />
                </div>
                Achievements
            </h2>
            <div className="grid gap-4">
                {achievements.length > 0 ? (
                    achievements.map((achievement) => (
                        <div key={achievement.id} className="group flex items-center gap-4 p-5 rounded-3xl border-2 border-slate-100 bg-white hover:border-amber-200 transition-all shadow-sm">
                            <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                🏆
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{achievement.achievement?.name || achievement.name}</p>
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Milestone Completed</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-10 rounded-[2rem] border-2 border-dashed border-slate-200 text-center bg-slate-50/30">
                        <p className="text-slate-400 font-bold text-sm">No achievements yet. Keep growing!</p>
                    </div>
                )}
            </div>
        </section>

        {/* Leaderboard Section */}
        <section className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <Icons.Trophy />
                </div>
                Leaderboard
            </h2>
            <div className="overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-xl shadow-slate-100">
                <div className="divide-y divide-slate-50">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((item, index) => (
                        <div key={item.userId || index} className={`flex items-center justify-between p-5 ${index === 0 ? 'bg-cyan-50/30' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
                                    index === 0 ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 
                                    index === 1 ? 'bg-slate-300 text-white' :
                                    index === 2 ? 'bg-orange-300 text-white' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                    {index + 1}
                                </span>
                                <div>
                                    <p className="font-bold text-slate-900">{item.user?.fullName || item.fullName || 'Learner'}</p>
                                    {index === 0 && <span className="text-[8px] font-black text-cyan-600 uppercase tracking-tighter">Current Champion</span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900">{item.points}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Points</p>
                            </div>
                        </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-slate-400 font-bold text-sm">No active rankings yet.</div>
                    )}
                </div>
                <div className="bg-slate-50 p-4 text-center">
                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">View Full Leaderboard</button>
                </div>
            </div>
        </section>
      </div>
    </div>
  );
}
