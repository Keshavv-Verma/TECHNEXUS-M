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
  localStorage.removeItem('cart');
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

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(padded));
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = decodeJwtPayload(token);
    if (!payload?.exp) return false;
    // Small clock skew buffer so fresh tokens are not cleared immediately
    const skewMs = 30_000;
    return payload.exp * 1000 < Date.now() - skewMs;
  } catch {
    // If decode fails, do not wipe auth client-side — let the API validate
    return false;
  }
};

export const isLoggedIn = () => {
  const token = getToken();
  if (token && !isTokenExpired(token)) {
    return true;
  }
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken && !isTokenExpired(refreshToken)) {
    return true;
  }
  return false;
};

export const clearAuth = () => {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem('cart');
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
