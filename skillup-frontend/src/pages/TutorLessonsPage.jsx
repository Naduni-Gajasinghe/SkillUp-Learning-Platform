import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { createLesson, deleteLesson, fetchCategories, fetchLessons } from '../services/lessonService';
import { createAssignment, fetchAssignments } from '../services/submissionService';

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);

export default function TutorLessonsPage() {
  const userId = useSelector((state) => state.auth.user?.id);
  const [categories, setCategories] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    try {
      setLoading(true);
      const [categoryData, lessonData, assignmentData] = await Promise.all([
        fetchCategories(),
        fetchLessons(),
        fetchAssignments(),
      ]);
      setCategories(categoryData);
      setLessons(lessonData);
      setAssignments(assignmentData);
    } catch (error) {
      console.error('Failed to load tutor lessons:', error);
    } finally {
      setLoading(false);
    }
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
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      await deleteLesson(id);
      await load();
    }
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

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-4";
  const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="mx-auto max-w-7xl space-y-12 p-6 lg:p-8 text-slate-900">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Lesson Management</h1>
        <p className="mt-2 text-slate-600">Create and organize your educational content and assignments.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-2">
        <section className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <PlusIcon />
              </div>
              <h2 className="text-xl font-bold">Create New Lesson</h2>
            </div>
            
            <form className="space-y-4" onSubmit={onCreate}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Lesson Title</label>
                  <input className={inputClasses} placeholder="e.g. Introduction to React Hooks" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required />
                </div>
                
                <div>
                  <label className={labelClasses}>Category</label>
                  <select className={inputClasses} value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} required>
                    <option value="">Select Category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Difficulty</label>
                  <select className={inputClasses} value={form.difficulty} onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value }))}>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>Description</label>
                  <textarea className={inputClasses} rows={3} placeholder="Provide a brief overview of the lesson..." value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required />
                </div>

                <div>
                  <label className={labelClasses}>Content Type</label>
                  <select className={inputClasses} value={form.contentType} onChange={(e) => setForm((prev) => ({ ...prev, contentType: e.target.value }))}>
                    <option value="TEXT">Text Based</option>
                    <option value="VIDEO">Video Lesson</option>
                    <option value="PDF">PDF Guide</option>
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Upload File</label>
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>

                <div className="md:col-span-2 py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" checked={form.isPremium} onChange={(e) => setForm((prev) => ({ ...prev, isPremium: e.target.checked }))} />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Mark as Premium Lesson</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.99]">
                    Publish Lesson
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <PlusIcon />
              </div>
              <h2 className="text-xl font-bold">Create Assignment</h2>
            </div>

            <form className="space-y-4" onSubmit={onCreateAssignment}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className={labelClasses}>Assignment Title</label>
                  <input className={inputClasses} placeholder="e.g. Build a Todo App" value={assignmentForm.title} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, title: e.target.value }))} required />
                </div>

                <div>
                  <label className={labelClasses}>Related Lesson</label>
                  <select className={inputClasses} value={assignmentForm.lessonId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, lessonId: e.target.value }))}>
                    <option value="">Stand-alone Assignment</option>
                    {myLessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClasses}>Due Date</label>
                  <input type="datetime-local" className={inputClasses} value={assignmentForm.dueDate} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, dueDate: e.target.value }))} />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>Instructions</label>
                  <textarea className={inputClasses} rows={3} placeholder="Enter detailed instructions for learners..." value={assignmentForm.description} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, description: e.target.value }))} required />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClasses}>Assignment File</label>
                  <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)} />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.99]">
                    Create Assignment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-6 bg-slate-50/50">
              <h2 className="text-xl font-bold">Published Lessons</h2>
            </div>
            <div className="p-6">
              {myLessons.length > 0 ? (
                <div className="space-y-6">
                  {myLessons.map((lesson) => (
                    <div key={lesson.id} className="group rounded-2xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg group-hover:text-indigo-600 transition-colors">{lesson.title}</h3>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{lesson.category?.name} • {lesson.difficulty}</p>
                        </div>
                        <button onClick={() => onDelete(lesson.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                          <TrashIcon />
                        </button>
                      </div>

                      <div className="mt-5 space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assignments</h4>
                        <div className="space-y-2">
                          {(assignmentsByLesson[lesson.id] || []).length > 0 ? (
                            (assignmentsByLesson[lesson.id] || []).map((assignment) => (
                              <div key={assignment.id} className="flex items-center gap-3 rounded-xl border border-slate-50 bg-slate-50/50 p-3">
                                <FileIcon />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-700">{assignment.title}</p>
                                  <p className="truncate text-xs text-slate-500">{assignment.description}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400 italic">No assignments linked.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <PlusIcon />
                  </div>
                  <p className="mt-4 font-medium text-slate-600">No lessons created yet.</p>
                  <p className="text-sm text-slate-500">Start by filling out the form on the left.</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 p-6 bg-slate-50/50">
              <h2 className="text-xl font-bold">Unlinked Assignments</h2>
            </div>
            <div className="p-6">
              {unlinkedAssignments.length > 0 ? (
                <div className="grid gap-4">
                  {unlinkedAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 transition-all hover:bg-slate-50">
                      <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
                        <FileIcon />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{assignment.title}</p>
                        <p className="text-sm text-slate-600 line-clamp-1">{assignment.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-slate-500 text-sm">No unlinked assignments found.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
