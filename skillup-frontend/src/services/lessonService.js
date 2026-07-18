import apiClient from '../api/client';

export const fetchLessons = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );

  const { data } = await apiClient.get('/lessons', { params: cleanParams });
  return data.data || [];
};

export const fetchLessonById = async (id) => {
  const { data } = await apiClient.get(`/lessons/${id}`);
  return data.data;
};

export const unlockLessonAccess = async (lessonId, amount = 10) => {
  const { data } = await apiClient.post('/payments', {
    lessonId,
    amount,
    paymentMethod: 'CARD',
    gateway: 'STRIPE',
    purpose: `LESSON_ACCESS:${lessonId}`,
  });
  return data.data;
};

export const createLesson = async (formData) => {
  const { data } = await apiClient.post('/lessons', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateLesson = async (id, formData) => {
  const { data } = await apiClient.patch(`/lessons/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteLesson = async (id) => {
  const { data } = await apiClient.delete(`/lessons/${id}`);
  return data;
};

export const fetchCategories = async () => {
  const { data } = await apiClient.get('/categories');
  return data.data || [];
};
