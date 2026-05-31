import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { completeLesson, trackLessonView } from '../services/learnerService';
import { fetchCategories, fetchLessons } from '../services/lessonService';

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ search: '', categoryId: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [lessonData, categoryData] = await Promise.all([
        fetchLessons(filters),
        fetchCategories(),
      ]);
      setLessons(lessonData);
      setCategories(categoryData);
      setLoading(false);
    };

    load();
  }, [filters]);

  const difficultyBadge = useMemo(
    () => ({
      BEGINNER: 'bg-emerald-100 text-emerald-700',
      INTERMEDIATE: 'bg-amber-100 text-amber-700',
      ADVANCED: 'bg-rose-100 text-rose-700',
    }),
    []
  );

  const onTrackView = async (lessonId) => {
    await trackLessonView(lessonId);
  };

  const onComplete = async (lessonId) => {
    await completeLesson(lessonId);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Lessons</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search lessons"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={filters.categoryId}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <p className="text-sm text-slate-500">Loading lessons...</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => (
          <Card key={lesson.id}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{lesson.title}</h2>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${difficultyBadge[lesson.difficulty] || 'bg-slate-100 text-slate-700'}`}>
                {lesson.difficulty}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-600">{lesson.description}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {lesson.category?.name || 'General'}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                {lesson.contentType}
              </span>
              <span className={`rounded-full px-2 py-1 text-xs font-semibold ${lesson.isPremium ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {lesson.isPremium ? 'Premium' : 'Free'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/learner/lessons/${lesson.id}`}>
                <Button variant="secondary">View Details</Button>
              </Link>
              <Button onClick={() => onTrackView(lesson.id)}>Track View</Button>
              <Button variant="ghost" onClick={() => onComplete(lesson.id)}>Mark Complete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
