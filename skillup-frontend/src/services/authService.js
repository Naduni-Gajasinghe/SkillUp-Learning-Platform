import apiClient from '../api/client';

export const loginRequest = async (payload) => {
  const { data } = await apiClient.post('/auth/login', payload);
  return data.data;
};

export const registerRequest = async (payload) => {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
};

export const resetPasswordRequest = async (payload) => {
  const { data } = await apiClient.post('/auth/reset-password', payload);
  return data;
};
