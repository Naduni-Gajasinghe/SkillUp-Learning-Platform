import apiClient from '../api/client';

export const fetchMyProfile = async () => {
  const { data } = await apiClient.get('/profiles/me');
  return data.data;
};

export const updateMyProfile = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    // Append files/blobs directly
    if (typeof File !== 'undefined' && value instanceof File) {
      formData.append(key, value);
      return;
    }
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      formData.append(key, value);
      return;
    }

    // Arrays should be joined as comma-separated strings (backend expects strings)
    if (Array.isArray(value)) {
      formData.append(key, value.join(','));
      return;
    }

    // Objects -> JSON string
    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  const { data } = await apiClient.patch('/profiles/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};

export const fetchTutorProfiles = async () => {
  const { data } = await apiClient.get('/profiles/tutors');
  return data.data || [];
};

export const applyForTutor = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (typeof File !== 'undefined' && value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(','));
      return;
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, String(value));
  });

  const { data } = await apiClient.patch('/profiles/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};
