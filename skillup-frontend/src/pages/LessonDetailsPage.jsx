import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { completeLesson, trackLessonView } from '../services/learnerService';
import { fetchLessonById } from '../services/lessonService';
import { processPayment } from '../services/tutorService';

export default function LessonDetailsPage() {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlockAmount, setUnlockAmount] = useState('10');
  const [unlockMessage, setUnlockMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const lessonData = await fetchLessonById(id);
      setLesson(lessonData);
      setLoading(false);
    };

    load();
  }, [id]);

  const unlockPremiumLesson = async () => {
    setUnlockMessage('Processing Stripe payment...');
    await processPayment({
      lessonId: id,
      amount: Number(unlockAmount),
      paymentMethod: 'CARD',
      gateway: 'STRIPE',
      purpose: `LESSON_ACCESS:${id}`,
    });
    const lessonData = await fetchLessonById(id);
    setLesson(lessonData);
    setUnlockMessage('Premium access unlocked with Stripe.');
  };

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

      {lesson.accessRestricted ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-900">Premium lesson locked</p>
          <p className="mt-1 text-sm text-amber-800">
            Pay with Stripe to unlock this lesson. After payment, the content link will become available.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min="1"
              step="0.01"
              className="w-40 rounded-lg border border-amber-300 px-3 py-2 text-sm"
              value={unlockAmount}
              onChange={(e) => setUnlockAmount(e.target.value)}
            />
            <Button onClick={unlockPremiumLesson}>Unlock with Stripe</Button>
          </div>
          {unlockMessage ? <p className="mt-2 text-sm text-amber-900">{unlockMessage}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={() => trackLessonView(id)}>Track View</Button>
        <Button variant="secondary" onClick={() => completeLesson(id)}>Mark Complete</Button>
      </div>
    </Card>
  );
}
