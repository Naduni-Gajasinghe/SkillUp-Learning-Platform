import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { completeLesson, trackLessonView } from '../services/learnerService';
import { fetchLessonById, unlockLessonAccess } from '../services/lessonService';

const Icons = {
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  Lock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
  ),
  BookOpen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  Award: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15 2 5-2-5-5-2 5-2 2-5 2 5 5 2-5 2Z"/><path d="M2 20h.01"/><path d="M7 21h.01"/><path d="M12 22h.01"/><path d="M17 21h.01"/><path d="M22 20h.01"/></svg>
  ),
};

export default function LessonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockAmount, setUnlockAmount] = useState('10');
  const [unlockMessage, setUnlockMessage] = useState('');
  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('skillup_access_token') : null;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const lessonData = await fetchLessonById(id);
        setLesson(lessonData);
        // Automatically track view if accessible
        if (lessonData && !lessonData.accessRestricted) {
           trackLessonView(id);
        }
      } catch (err) {
        console.error('Failed to load lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const unlockPremiumLesson = async () => {
    setUnlockMessage('Connecting to payment gateway...');
    try {
        await unlockLessonAccess(id, Number(unlockAmount));
        const lessonData = await fetchLessonById(id);
        setLesson(lessonData);
        setUnlockMessage(lessonData?.canAccess ? 'Payment successful! Access granted.' : 'Payment completed. You can now open the lesson content.');
    } catch (err) {
        setUnlockMessage('Payment failed. Please try again.');
    }
  };

  const onComplete = async () => {
      await completeLesson(id);
      // Optional: Refresh data to show completed status
      const lessonData = await fetchLessonById(id);
      setLesson(lessonData);
  };

  if (loading) {
      return (
        <div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600"></div>
        </div>
      );
  }

  if (!lesson) {
      return (
        <div className="mx-auto max-w-2xl py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-900">Lesson Not Found</h2>
            <p className="mt-2 text-slate-600">The lesson you are looking for might have been removed or moved.</p>
            <Button className="mt-6" onClick={() => navigate('/learner/lessons')}>Back to Lessons</Button>
        </div>
      );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={() => navigate('/learner/lessons')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors group"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
            <Icons.ChevronLeft />
        </div>
        Back to Learning Path
      </button>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
        {/* Header Visual */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 to-indigo-500"></div>
        
        <div className="p-8 md:p-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase ${
                    lesson.difficulty === 'BEGINNER' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    lesson.difficulty === 'INTERMEDIATE' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-rose-50 text-rose-700 border border-rose-100'
                }`}>
                    {lesson.difficulty}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-slate-500 border border-slate-200">
                    {lesson.contentType}
                </span>
                {lesson.isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black tracking-widest uppercase text-indigo-700 border border-indigo-100">
                        <Icons.Lock />
                        Premium
                    </span>
                )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {lesson.title}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-3xl mb-10">
                {lesson.description}
            </p>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    {/* Content Link Section */}
                    <div className="rounded-3xl bg-slate-50 p-8 border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm text-cyan-600">
                                <Icons.BookOpen />
                            </div>
                            Lesson Materials
                        </h2>
                        
                        {lesson.contentUrl && !lesson.accessRestricted ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-600">Click below to open the lesson content in a new tab. Ensure your pop-up blocker is disabled.</p>
                                <a
                                    href={`http://localhost:5000${lesson.contentUrl}${accessToken ? `?token=${encodeURIComponent(accessToken)}` : ''}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-cyan-200 hover:bg-cyan-500 hover:-translate-y-0.5 transition-all"
                                >
                                    Open Learning Content
                                    <Icons.ExternalLink />
                                </a>
                            </div>
                        ) : lesson.accessRestricted ? (
                            <div className="text-center py-6">
                                <div className="mx-auto h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                                    <Icons.Lock />
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Access Restricted</p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No direct content URL provided for this lesson.</p>
                        )}
                    </div>

                    {/* Restricted Access UI */}
                    {lesson.accessRestricted && (
                        <div className="rounded-3xl border-2 border-indigo-200 bg-indigo-50/30 p-8 shadow-inner">
                            <h3 className="text-xl font-bold text-indigo-900 mb-2">Unlock Premium Insights</h3>
                            <p className="text-sm text-indigo-800/80 mb-6 leading-relaxed">
                                This is a premium lesson. Unlock it now for a one-time fee to access full video materials, downloadable guides, and direct tutor feedback.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-indigo-400">LKR</span>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        className="w-32 rounded-2xl border-none bg-white px-12 py-4 text-sm font-bold text-indigo-900 shadow-sm focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        value={unlockAmount}
                                        onChange={(e) => setUnlockAmount(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    onClick={unlockPremiumLesson}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white border-none py-4 px-8 rounded-2xl font-black shadow-lg shadow-indigo-200"
                                >
                                    Unlock with Stripe
                                </Button>
                            </div>
                            {unlockMessage && (
                                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse">
                                    {unlockMessage}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="w-full md:w-64 space-y-6">
                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Tutor Details</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                {lesson.tutor?.fullName?.[0] || 'T'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{lesson.tutor?.fullName || 'Expert Tutor'}</p>
                                <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest">Verified Instructor</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Completion Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${lesson.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-200'}`}></div>
                                <span className="text-xs font-bold text-slate-700">{lesson.isCompleted ? 'Marked Complete' : 'In Progress'}</span>
                            </div>
                            <Button 
                                variant={lesson.isCompleted ? 'secondary' : 'primary'}
                                onClick={onComplete}
                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                disabled={lesson.isCompleted}
                            >
                                <Icons.Award />
                                {lesson.isCompleted ? 'Finished' : 'Mark Complete'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
