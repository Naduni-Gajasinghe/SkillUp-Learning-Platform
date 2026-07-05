import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { completeLesson, trackLessonView } from '../services/learnerService';
import { fetchCategories, fetchLessons } from '../services/lessonService';

const LockIcon = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const SearchIcon = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const BookOpenIcon = ({ className = 'h-4 w-4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', categoryId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [lessonData, categoryData] = await Promise.all([
          fetchLessons(filters),
          fetchCategories(),
        ]);
        setLessons(lessonData);
        setCategories(categoryData);
      } catch (error) {
        console.error('Failed to load lessons:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters]);

  const difficultyBadge = useMemo(
    () => ({
      BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      INTERMEDIATE: 'bg-amber-50 text-amber-700 border-amber-100',
      ADVANCED: 'bg-rose-50 text-rose-700 border-rose-100',
    }),
    []
  );

  const statusBadge = useMemo(
    () => ({
      OPEN: 'bg-slate-100 text-slate-600 border-slate-200',
      INPROGRESS: 'bg-blue-50 text-blue-700 border-blue-100',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    }),
    []
  );

  const onTrackView = async (lessonId) => {
    await trackLessonView(lessonId);
  };

  const onComplete = async (lessonId) => {
    try {
      await completeLesson(lessonId);
      // Refresh lessons to show updated status
      const lessonData = await fetchLessons(filters);
      setLessons(lessonData);
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Explore Lessons</h1>
          <p className="mt-2 text-slate-600">Discover new topics and advance your skills with our curated courses.</p>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by lesson title or description..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-4"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-4"
              value={filters.categoryId}
              onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</h2>
                      {lesson.status && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[lesson.status]}`}>
                          {lesson.status === 'INPROGRESS' ? 'In Progress' : lesson.status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-500">by {lesson.tutor?.fullName || 'Expert Tutor'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${difficultyBadge[lesson.difficulty] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                    {lesson.difficulty}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 line-clamp-3 flex-1">{lesson.description}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {lesson.category?.name || 'General'}
                  </span>
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 uppercase">
                    {lesson.contentType}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${lesson.isPremium ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {lesson.isPremium && <LockIcon className="h-3 w-3" />}
                    {lesson.isPremium ? 'PREMIUM' : 'FREE'}
                  </span>
                </div>

                <div className="mt-8 flex items-center gap-3">
                  <Link to={`/learner/lessons/${lesson.id}`} className="flex-1" onClick={() => onTrackView(lesson.id)}>
                    <button className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]">
                      View Lesson
                    </button>
                  </Link>
                  <button 
                    onClick={() => onComplete(lesson.id)}
                    disabled={lesson.status === 'COMPLETED'}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                      lesson.status === 'COMPLETED' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700 cursor-default' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lesson.status === 'COMPLETED' ? 'Done ✓' : 'Mark Done'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {lessons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-slate-100 p-6 text-slate-400">
                <BookOpenIcon className="h-12 w-12" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-900">No lessons found</h3>
              <p className="mt-2 max-w-xs text-slate-500">We couldn't find any lessons matching your current search or filters.</p>
              <button 
                onClick={() => setFilters({ search: '', categoryId: '' })}
                className="mt-6 font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
