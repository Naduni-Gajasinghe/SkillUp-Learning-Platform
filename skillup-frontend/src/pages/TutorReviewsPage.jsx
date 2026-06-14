import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchAssignments, fetchAssignmentSubmissions, reviewSubmission } from '../services/submissionService';

// Icons
const Icons = {
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
  ),
  CheckCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
};

export default function TutorReviewsPage() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(80);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAssignments = async () => {
      const data = await fetchAssignments();
      setAssignments(data);
    };

    loadAssignments();
  }, []);

  const onLoadSubmissions = async () => {
    if (!assignmentId) return;
    setLoading(true);
    setError('');
    try {
        const data = await fetchAssignmentSubmissions(assignmentId);
        setSubmissions(data);
        setSelectedSubmissionId(data[0]?.id || '');
        setFeedback('');
        setScore(80);
    } finally {
        setLoading(false);
    }
  };

  const selectedSubmission = submissions.find((submission) => submission.id === selectedSubmissionId) || null;

  const getDocumentUrl = (submission) => {
    if (!submission?.fileUrl) return null;
    return `http://localhost:5000${submission.fileUrl}`;
  };

  const onReview = async () => {
    if (!selectedSubmissionId) return;
    if (feedback.trim().length < 5) {
      setError('Please enter feedback with at least 5 characters.');
      return;
    }

    try {
      setError('');
      await reviewSubmission(selectedSubmissionId, { feedback, score: Number(score) });
      await onLoadSubmissions();
    } catch (submissionError) {
      setError(submissionError.response?.data?.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10 animate-in fade-in duration-500">
      <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Grading Center</h1>
          <p className="text-lg text-slate-600 font-medium">Review and provide feedback on student submissions.</p>
      </header>

      <Card className="rounded-[2rem] border-none shadow-xl shadow-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Assignment</label>
                <select
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none"
                    value={assignmentId}
                    onChange={(e) => setAssignmentId(e.target.value)}
                >
                    <option value="">Choose an assignment...</option>
                    {assignments.map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                    ))}
                </select>
            </div>
            <Button onClick={onLoadSubmissions} className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest sm:mt-6">
                {loading ? 'Loading...' : 'Load Work'}
            </Button>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-[400px,1fr]">
        {/* Submissions List */}
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-2">
                <Icons.User />
                Submissions ({submissions.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {submissions.map((submission) => (
                <button
                    key={submission.id}
                    onClick={() => setSelectedSubmissionId(submission.id)}
                    className={`w-full group rounded-3xl border-2 p-5 text-left transition-all duration-200 ${
                        selectedSubmissionId === submission.id
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-100'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-600 shadow-sm">
                                {submission.learner?.fullName?.[0] || 'L'}
                            </div>
                            <p className="font-bold text-slate-900">{submission.learner?.fullName}</p>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                            submission.status === 'REVIEWED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                            {submission.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Icons.Clock />
                        <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                </button>
                ))}
                {submissions.length === 0 && !loading && (
                    <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center bg-slate-50/30">
                        <p className="text-slate-400 font-bold text-sm italic">No work loaded yet.</p>
                    </div>
                )}
            </div>
        </section>

        {/* Review Area */}
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 px-2">
                <Icons.FileText />
                Submission Detail
            </h2>
            
            {selectedSubmission ? (
              <div className="space-y-8">
                <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 p-8">
                    <div className="flex flex-wrap items-end justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                        <div>
                            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-2 block">Viewing Work From</span>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{selectedSubmission.learner?.fullName}</h3>
                            <p className="text-sm text-slate-500 font-medium mt-2">Assignment: <span className="text-slate-900 font-bold">{selectedSubmission.assignment?.title}</span></p>
                        </div>
                        {getDocumentUrl(selectedSubmission) ? (
                            <a
                            href={getDocumentUrl(selectedSubmission)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-xs font-black text-white shadow-xl shadow-cyan-100 hover:bg-cyan-500 transition-all"
                            >
                            Open Document
                            <Icons.Search />
                            </a>
                        ) : (
                            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100">No File Uploaded</span>
                        )}
                    </div>

                    {selectedSubmission.content && (
                        <div className="mb-10 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Student Notes</span>
                             <p className="text-slate-600 font-medium leading-relaxed italic">" {selectedSubmission.content} "</p>
                        </div>
                    )}

                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-slate-900">Your Evaluation</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Score</span>
                                <input
                                    type="number"
                                    className="w-20 rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-sm font-black text-cyan-700 text-center focus:bg-white focus:border-cyan-500 outline-none"
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    min={0}
                                    max={100}
                                />
                                <span className="font-black text-slate-300 text-xl">/ 100</span>
                            </div>
                        </div>

                        <textarea
                            className="w-full rounded-3xl border-2 border-slate-100 bg-slate-50 px-6 py-4 text-sm font-medium text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                            rows={6}
                            placeholder="Write constructive feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            minLength={5}
                            required
                        />

                        {error && (
                            <div className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100 animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button 
                                onClick={onReview}
                                className="px-10 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-100 flex items-center gap-3 group"
                            >
                                Submit Grade
                                <Icons.CheckCircle />
                            </Button>
                        </div>
                    </div>
                </Card>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 mb-4">
                        <Icons.Search />
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Select a student from the list to begin review</p>
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
