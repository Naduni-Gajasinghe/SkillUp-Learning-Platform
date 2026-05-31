import apiClient from '../api/client';

export const fetchRecommendations = async () => {
  const { data } = await apiClient.get('/ai/recommendations');
  return data.data || [];
};

export const fetchLearningPath = async () => {
  const { data } = await apiClient.get('/ai/learning-path');
  return data.data || [];
};

export const fetchProgress = async () => {
  const { data } = await apiClient.get('/progress/me');
  return data.data || [];
};

export const trackLessonView = async (lessonId) => {
  const { data } = await apiClient.post(`/progress/view/${lessonId}`);
  return data;
};

export const completeLesson = async (lessonId) => {
  const { data } = await apiClient.post(`/progress/complete/${lessonId}`);
  return data;
};

export const fetchPoints = async () => {
  const { data } = await apiClient.get('/gamification/points');
  return data.data;
};

export const fetchBadges = async () => {
  const { data } = await apiClient.get('/gamification/badges');
  return data.data || [];
};

export const fetchAchievements = async () => {
  const { data } = await apiClient.get('/gamification/achievements');
  return data.data || [];
};

export const fetchLeaderboard = async (limit = 10) => {
  const { data } = await apiClient.get('/gamification/leaderboard', { params: { limit } });
  return data.data || [];
};

export const fetchLearnerStats = async () => {
  const { data } = await apiClient.get('/analytics/learning-stats');
  return data.data;
};
