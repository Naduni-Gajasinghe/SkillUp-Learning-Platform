import apiClient from '../api/client';

export const fetchAssignments = async () => {
  const { data } = await apiClient.get('/assignments');
  return data.data || [];
};

export const createAssignment = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (typeof File !== 'undefined' && value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, String(value));
  });

  const { data } = await apiClient.post('/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};

export const submitAssignmentWork = async (assignmentId, file, content) => {
  const formData = new FormData();
  if (file) formData.append('submission', file);
  if (content) formData.append('content', content);

  const { data } = await apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};

export const fetchMySubmissions = async () => {
  const { data } = await apiClient.get('/submissions/my-submissions');
  return data.data || [];
};

export const fetchSubmissionReview = async (submissionId) => {
  const { data } = await apiClient.get(`/reviews/${submissionId}`);
  return data.data;
};

export const fetchAssignmentSubmissions = async (assignmentId) => {
  const { data } = await apiClient.get(`/assignments/${assignmentId}/submissions`);
  return data.data || [];
};

export const reviewSubmission = async (submissionId, payload) => {
  const { data } = await apiClient.post(`/assignments/submissions/${submissionId}/review`, payload);
  return data.data;
};
