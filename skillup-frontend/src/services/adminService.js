import apiClient from '../api/client';

export const fetchPlatformAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/platform');
  return data.data;
};

export const fetchAdminPaymentWorkflow = async () => {
  const { data } = await apiClient.get('/payments/workflow');
  return data.data;
};

export const fetchPendingTutorApplications = async () => {
  const { data } = await apiClient.get('/admin/tutors/pending');
  return data.data || [];
};

export const updateTutorVerificationStatus = async (userId, verificationStatus) => {
  const { data } = await apiClient.patch(`/admin/tutors/${userId}/verification`, { verificationStatus });
  return data.data;
};

export const updatePaymentStatus = async (paymentId, status) => {
  const { data } = await apiClient.patch(`/payments/${paymentId}/status`, { status });
  return data.data;
};