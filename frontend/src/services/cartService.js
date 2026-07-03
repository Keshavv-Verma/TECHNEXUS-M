import axios from 'axios';
import { AuthError, getToken } from '../utils/authUtils';

const api = axios.create();
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getApiBase = () => {
  const raw = process.env.REACT_APP_API_URL;
  if (!raw) {
    throw new Error('API URL is not configured. Set REACT_APP_API_URL in frontend/.env');
  }
  return raw.replace(/\/+$/, '');
};

const handleResponse = (promise) =>
  promise
    .then((res) => res.data)
    .catch((err) => {
      if (err.response) {
        const data = err.response.data || {};
        if (err.response.status === 401) {
          throw new AuthError(
            data.error === 'No token provided'
              ? 'Please sign in to continue.'
              : 'Your session has expired. Please sign in again.'
          );
        }
        throw new Error(data.error || `Request failed (${err.response.status})`);
      }
      throw err;
    });

export const getCartItems = () =>
  handleResponse(api.get(`${getApiBase()}/api/cart`));

export const addCartItem = (productId, quantity = 1) =>
  handleResponse(api.post(`${getApiBase()}/api/cart`, { productId, quantity }));

export const updateCartItem = (productId, quantity) =>
  handleResponse(api.patch(`${getApiBase()}/api/cart/${productId}`, { quantity }));

export const removeCartItem = (productId) =>
  handleResponse(api.delete(`${getApiBase()}/api/cart/${productId}`));
