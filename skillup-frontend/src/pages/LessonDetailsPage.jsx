import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { completeLesson, trackLessonView } from '../services/learnerService';
import { fetchLessonById } from '../services/lessonService';

export default function LessonDetailsPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const lessonData = await fetchLessonById(id);
      setLesson(lessonData);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) return <p className="text-sm text-slate-500">Loading lesson...</p>;
  if (!lesson) return <p className="text-sm text-rose-600">Lesson not found.</p>;

  return (
    <Card>
      <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{lesson.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{lesson.difficulty}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">{lesson.contentType}</span>
        <span className={`rounded-full px-2 py-1 text-xs ${lesson.isPremium ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
          {lesson.isPremium ? 'Premium' : 'Free'}
        </span>
      </div>

      {lesson.contentUrl ? (
        <a
          href={`http://localhost:5000${lesson.contentUrl}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-cyan-700"
        >
          Open lesson content
        </a>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => trackLessonView(id)}>Track View</Button>
        <Button variant="secondary" onClick={() => completeLesson(id)}>Mark Complete</Button>
      </div>
    </Card>
  );
}
