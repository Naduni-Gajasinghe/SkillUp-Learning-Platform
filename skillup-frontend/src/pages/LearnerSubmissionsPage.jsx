import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchAssignments, fetchMySubmissions, fetchSubmissionReview, submitAssignmentWork } from '../services/submissionService';

// Icons
const Icons = {
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  MessageCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  ),
  ExternalLink: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
  ),
};

export default function LearnerSubmissionsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [reviewMap, setReviewMap] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    const [assignmentData, submissionData] = await Promise.all([
      fetchAssignments(),
      fetchMySubmissions(),
    ]);
    setAssignments(assignmentData);
    setSubmissions(submissionData);
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmitWork = async (event) => {
    event.preventDefault();
    if (!selectedAssignment) return;

    setIsSubmitting(true);
    try {
        await submitAssignmentWork(selectedAssignment, file, content);
        setContent('');
        setFile(null);
        setSelectedAssignment('');
        await load();
    } finally {
        setIsSubmitting(false);
    }
  };

  const onLoadReview = async (submissionId) => {
    const review = await fetchSubmissionReview(submissionId);
    setReviewMap((prev) => ({ ...prev, [submissionId]: review }));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-10 p-6 md:p-10 animate-in fade-in duration-500">
      <header>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Assignment Portal</h1>
          <p className="text-lg text-slate-600 font-medium">Turn in your work and review tutor feedback.</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr,450px]">
        {/* Submissions History */}
        <section className="space-y-6 order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-100">
                    <Icons.FileText />
                </div>
                My Submissions
            </h2>
            
            <div className="space-y-4">
                {submissions.map((submission) => (
                    <div key={submission.id} className="group rounded-[2rem] border-2 border-slate-100 bg-white p-6 transition-all hover:border-cyan-200 hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                                    {submission.assignment?.title || 'Untitled Assignment'}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Submitted {new Date(submission.submittedAt || Date.now()).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                submission.status === 'REVIEWED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                submission.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                                {submission.status}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => onLoadReview(submission.id)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                <Icons.MessageCircle />
                                {reviewMap[submission.id] ? 'Refresh Feedback' : 'View Feedback'}
                            </button>
                            {submission.fileUrl && (
                                <a
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                    href={`http://localhost:5000${submission.fileUrl}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Icons.ExternalLink />
                                    Open Work
                                </a>
                            )}
                        </div>

                        {reviewMap[submission.id] && (
                            <div className="mt-6 p-6 rounded-3xl bg-cyan-50 border-2 border-cyan-100 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-cyan-200/50">
                                    <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest">Tutor Review</span>
                                    <div className="flex items-center gap-1">
                                        <span className="text-2xl font-black text-cyan-700">{reviewMap[submission.id].score}</span>
                                        <span className="text-xs font-bold text-cyan-500">/ 100</span>
                                    </div>
                                </div>
                                <p className="text-sm text-cyan-900 font-medium leading-relaxed italic">
                                    " {reviewMap[submission.id].feedback} "
                                </p>
                            </div>
                        )}
                    </div>
                ))}
                {submissions.length === 0 && (
                    <div className="p-20 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center bg-slate-50/30">
                        <p className="text-slate-400 font-bold">You haven't submitted any assignments yet.</p>
                    </div>
                )}
            </div>
        </section>

        {/* New Submission Form */}
        <aside className="order-1 lg:order-2">
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 p-8 sticky top-24">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Submit New Work</h2>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">Choose an assignment and upload your files or notes.</p>
                
                <form className="space-y-6" onSubmit={onSubmitWork}>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Assignment</label>
                        <select
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all appearance-none"
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            required
                        >
                            <option value="">Choose your assignment...</option>
                            {assignments.map((assignment) => (
                            <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Notes / Text Content</label>
                        <textarea
                            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                            rows={5}
                            placeholder="Briefly describe your submission or paste your work here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Attach Document</label>
                        <div className="relative group">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                            />
                            <div className="w-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center group-hover:border-cyan-400 group-hover:bg-cyan-50/30 transition-all">
                                <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-cyan-600 shadow-sm transition-colors">
                                    <Icons.Upload />
                                </div>
                                <p className="text-xs font-bold text-slate-500 group-hover:text-cyan-700 transition-colors">
                                    {file ? file.name : 'Click or drag file to upload'}
                                </p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">PDF, DOC, or ZIP (Max 10MB)</p>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !selectedAssignment}
                        className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest shadow-xl shadow-cyan-200 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                        {isSubmitting ? 'Uploading...' : 'Submit Assignment'}
                    </Button>
                </form>
            </Card>
        </aside>
      </div>
    </div>
  );
}
