import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchAssignments, fetchAssignmentSubmissions, reviewSubmission } from '../services/submissionService';

export default function TutorReviewsPage() {
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(80);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAssignments = async () => {
      const data = await fetchAssignments();
      setAssignments(data);
    };

    loadAssignments();
  }, []);

  const onLoadSubmissions = async () => {
    if (!assignmentId) return;
    setError('');
    const data = await fetchAssignmentSubmissions(assignmentId);
    setSubmissions(data);
    setSelectedSubmissionId(data[0]?.id || '');
    setFeedback('');
    setScore(80);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Review Submissions</h1>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
          >
            <option value="">Select assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
            ))}
          </select>
          <Button onClick={onLoadSubmissions}>Load submissions</Button>
        </div>
      </Card>

      <Card>
        <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
          <div className="space-y-3">
            {submissions.map((submission) => (
              <button
                key={submission.id}
                type="button"
                onClick={() => setSelectedSubmissionId(submission.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${selectedSubmissionId === submission.id ? 'border-cyan-500 bg-cyan-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <p className="font-semibold text-slate-900">Learner: {submission.learner?.fullName}</p>
                <p className="text-sm text-slate-600">Status: {submission.status}</p>
                <p className="text-xs text-slate-500">Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'Unknown'}</p>
                <p className="mt-2 text-sm text-cyan-700">Open document and review</p>
              </button>
            ))}
          {submissions.length === 0 ? <p className="text-sm text-slate-500">No submissions loaded.</p> : null}
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {selectedSubmission ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Selected submission</h3>
                  <p className="text-sm text-slate-600">{selectedSubmission.learner?.fullName}</p>
                  <p className="text-sm text-slate-600">Assignment: {selectedSubmission.assignment?.title || 'Assignment'}</p>
                </div>

                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">Submitted document</p>
                  {getDocumentUrl(selectedSubmission) ? (
                    <a
                      href={getDocumentUrl(selectedSubmission)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
                    >
                      Open document in new tab
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500">No file uploaded for this submission.</p>
                  )}
                  {selectedSubmission.content ? (
                    <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">Learner notes</p>
                      <p className="mt-1 whitespace-pre-wrap">{selectedSubmission.content}</p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">Review this submission</p>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    rows={4}
                    placeholder="Write feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    minLength={5}
                    required
                  />
                  <input
                    type="number"
                    className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    min={0}
                    max={100}
                  />
                  <div>
                    <Button onClick={onReview}>Submit review</Button>
                  </div>
                  {error ? <p className="text-sm text-rose-600">{error}</p> : null}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select a submission to preview the document and submit your review.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
