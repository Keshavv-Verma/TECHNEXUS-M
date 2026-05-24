const AUTH_KEYS = ['token', 'refreshToken', 'userId', 'isAdmin', 'currentUser'];

export const AUTH_CHANGED_EVENT = 'auth-changed';

export const getToken = () => localStorage.getItem('token');

/** Persist tokens after login or refresh */
export const persistAuth = ({
  token,
  refreshToken,
  isAdmin,
  userId,
  email,
}) => {
  if (!token) {
    throw new Error('No access token to store');
  }
  localStorage.setItem('token', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  localStorage.setItem('isAdmin', String(!!isAdmin));
  if (userId != null) {
    localStorage.setItem('userId', String(userId));
  }
  if (email) {
    localStorage.setItem(
      'currentUser',
      JSON.stringify({ username: email, userId: userId != null ? String(userId) : undefined })
    );
  }
  notifyAuthChange();
};

export const notifyAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const isLoggedIn = () => {
  const token = getToken();
  return !!token && !isTokenExpired(token);
};

export const clearAuth = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  notifyAuthChange();
};

export const redirectToLogin = (navigate, returnPath = '/cart') => {
  const redirect = returnPath.startsWith('/') ? returnPath : `/${returnPath}`;
  navigate('/login', { state: { redirect } });
};

export class AuthError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'AuthError';
    this.isAuthError = true;
  }
}
