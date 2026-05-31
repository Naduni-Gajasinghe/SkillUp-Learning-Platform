import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { createLesson, deleteLesson, fetchCategories, fetchLessons } from '../services/lessonService';
import { createAssignment, fetchAssignments } from '../services/submissionService';

export default function TutorLessonsPage() {
  const userId = useSelector((state) => state.auth.user?.id);
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'BEGINNER',
    contentType: 'TEXT',
    isPremium: false,
  });
  const [file, setFile] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    lessonId: '',
    dueDate: '',
  });
  const [assignmentFile, setAssignmentFile] = useState(null);

  const load = async () => {
    const [categoryData, lessonData, assignmentData] = await Promise.all([
      fetchCategories(),
      fetchLessons(),
      fetchAssignments(),
    ]);
    setCategories(categoryData);
    setLessons(lessonData);
    setAssignments(assignmentData);
  };

  useEffect(() => {
    load();
  }, []);

  const myLessons = useMemo(() => lessons.filter((lesson) => lesson.tutorId === userId || !lesson.tutorId), [lessons, userId]);
  const assignmentsByLesson = useMemo(() => {
    return myLessons.reduce((acc, lesson) => {
      acc[lesson.id] = assignments.filter((assignment) => assignment.lessonId === lesson.id);
      return acc;
    }, {});
  }, [assignments, myLessons]);

  const unlinkedAssignments = useMemo(
    () => assignments.filter((assignment) => !assignment.lessonId),
    [assignments],
  );

  const onCreate = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (file) formData.append('file', file);

    await createLesson(formData);
    setForm({
      title: '',
      description: '',
      categoryId: '',
      difficulty: 'BEGINNER',
      contentType: 'TEXT',
      isPremium: false,
    });
    setFile(null);
    await load();
  };

  const onDelete = async (id) => {
    await deleteLesson(id);
    await load();
  };

  const onCreateAssignment = async (event) => {
    event.preventDefault();

    await createAssignment({
      ...assignmentForm,
      assignment: assignmentFile,
    });

    setAssignmentForm({
      title: '',
      description: '',
      lessonId: '',
      dueDate: '',
    });
    setAssignmentFile(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Tutor Lesson Management</h1>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Create lesson</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} required>
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <textarea className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.difficulty} onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.contentType} onChange={(e) => setForm((prev) => ({ ...prev, contentType: e.target.value }))}>
            <option value="TEXT">Text</option>
            <option value="VIDEO">Video</option>
            <option value="PDF">PDF</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isPremium} onChange={(e) => setForm((prev) => ({ ...prev, isPremium: e.target.checked }))} />
            Premium lesson
          </label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="md:col-span-2"><Button type="submit">Create lesson</Button></div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Create assignment</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateAssignment}>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Assignment title"
            value={assignmentForm.title}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={assignmentForm.lessonId}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, lessonId: e.target.value }))}
          >
            <option value="">No related lesson</option>
            {myLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
            ))}
          </select>
          <textarea
            className="md:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={3}
            placeholder="Assignment description"
            value={assignmentForm.description}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
          <input
            type="datetime-local"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={assignmentForm.dueDate}
            onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))}
          />
          <input type="file" onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)} />
          <div className="md:col-span-2">
            <Button type="submit">Create assignment</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">My lessons</h2>
        <div className="mt-3 space-y-4">
          {myLessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                <p className="font-semibold text-slate-900">{lesson.title}</p>
                <p className="text-sm text-slate-600">{lesson.category?.name} · {lesson.difficulty}</p>
                </div>
                <Button variant="danger" onClick={() => onDelete(lesson.id)}>Delete</Button>
              </div>

              <div className="mt-3 rounded-md bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">Assignments for this lesson</p>
                <div className="mt-2 space-y-2">
                  {(assignmentsByLesson[lesson.id] || []).map((assignment) => (
                    <div key={assignment.id} className="rounded-md border border-slate-200 bg-white p-2">
                      <p className="text-sm font-medium text-slate-900">{assignment.title}</p>
                      <p className="text-xs text-slate-500">{assignment.description}</p>
                    </div>
                  ))}
                  {(assignmentsByLesson[lesson.id] || []).length === 0 ? (
                    <p className="text-sm text-slate-500">No assignments linked to this lesson yet.</p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {myLessons.length === 0 ? <p className="text-sm text-slate-500">No lessons yet.</p> : null}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Unlinked assignments</h2>
        <div className="mt-3 space-y-3">
          {unlinkedAssignments.map((assignment) => (
            <div key={assignment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-semibold text-slate-900">{assignment.title}</p>
              <p className="text-sm text-slate-600">{assignment.description}</p>
            </div>
          ))}
          {unlinkedAssignments.length === 0 ? <p className="text-sm text-slate-500">No standalone assignments yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
