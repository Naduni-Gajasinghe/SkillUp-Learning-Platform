import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { fetchAssignments, fetchMySubmissions, fetchSubmissionReview, submitAssignmentWork } from '../services/submissionService';

export default function LearnerSubmissionsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [reviewMap, setReviewMap] = useState({});

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

    await submitAssignmentWork(selectedAssignment, file, content);
    setContent('');
    setFile(null);
    await load();
  };

  const onLoadReview = async (submissionId) => {
    const review = await fetchSubmissionReview(submissionId);
    setReviewMap((prev) => ({ ...prev, [submissionId]: review }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Submit assignment</h2>
        <form className="mt-4 space-y-3" onSubmit={onSubmitWork}>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            required
          >
            <option value="">Select assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
            ))}
          </select>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            rows={4}
            placeholder="Add notes/content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button type="submit">Submit work</Button>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900">My submissions</h2>
        <div className="mt-3 space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="rounded-lg border border-slate-200 p-3">
              <p className="font-medium text-slate-900">{submission.assignment?.title || 'Assignment'}</p>
              <p className="text-sm text-slate-600">Status: {submission.status}</p>
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" onClick={() => onLoadReview(submission.id)}>
                  View feedback
                </Button>
                {submission.fileUrl ? (
                  <a
                    className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                    href={`http://localhost:5000${submission.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                ) : null}
              </div>
              {reviewMap[submission.id] ? (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <p><strong>Score:</strong> {reviewMap[submission.id].score}</p>
                  <p><strong>Feedback:</strong> {reviewMap[submission.id].feedback}</p>
                </div>
              ) : null}
            </div>
          ))}
          {submissions.length === 0 ? <p className="text-sm text-slate-500">No submissions yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
