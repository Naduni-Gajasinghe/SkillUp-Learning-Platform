import apiClient from '../api/client';

export const fetchTutorAnalytics = async () => {
  const { data } = await apiClient.get('/analytics/tutor');
  return data.data;
};

export const fetchNotifications = async () => {
  const { data } = await apiClient.get('/notifications');
  return data.data || [];
};

export const markNotificationRead = async (id) => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await apiClient.patch('/notifications/read-all');
  return data;
};

export const processPayment = async (payload) => {
  const { data } = await apiClient.post('/payments', payload);
  return data.data;
};

export const fetchPaymentHistory = async () => {
  const { data } = await apiClient.get('/payments/history');
  return data.data || [];
};

// Availability Management
export const fetchMyAvailability = async () => {
  const { data } = await apiClient.get('/tutors/me/availability');
  return data.data || [];
};

export const createAvailability = async (payload) => {
  const { data } = await apiClient.post('/tutors/availability/slots', payload);
  return data.data;
};

export const updateAvailability = async (id, payload) => {
  const { data } = await apiClient.patch(`/tutors/availability/${id}`, payload);
  return data.data;
};

export const deleteAvailability = async (id) => {
  const { data } = await apiClient.delete(`/tutors/availability/${id}`);
  return data;
};
