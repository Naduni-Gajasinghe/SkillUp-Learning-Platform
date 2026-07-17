import apiClient from '../api/client';

export const fetchTutors = async (params = {}) => {
  const { data } = await apiClient.get('/tutors', { params });
  return data.data || [];
};

export const fetchTutorById = async (id) => {
  const { data } = await apiClient.get(`/tutors/${id}`);
  return data.data;
};

export const fetchTutorAvailability = async (id) => {
  const { data } = await apiClient.get(`/tutors/${id}/availability`);
  return data.data || [];
};

export const createBooking = async (payload) => {
  const { data } = await apiClient.post('/bookings', payload);
  return data.data;
};

export const fetchMyBookings = async () => {
  const { data } = await apiClient.get('/bookings/me');
  return data.data || [];
};

export const cancelBooking = async (id, reason) => {
  const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason });
  return data.data;
};

export const updateBookingStatus = async (id, status, cancellationReason, zoomLink) => {
  const payload = { status };
  if (cancellationReason) payload.cancellationReason = cancellationReason;
  if (zoomLink) payload.zoomLink = zoomLink;
  const { data } = await apiClient.patch(`/bookings/${id}/status`, payload);
  return data.data;
};
