const AUTH_KEYS = ['token', 'userId', 'isAdmin', 'currentUser'];

export const getToken = () => localStorage.getItem('token');

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
