export const STORAGE_KEYS = {
  accessToken: 'skillup_access_token',
  refreshToken: 'skillup_refresh_token',
  user: 'skillup_user',
};

export const saveSession = ({ accessToken, refreshToken, user }) => {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken || '');
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken || '');
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user || null));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.user);
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
