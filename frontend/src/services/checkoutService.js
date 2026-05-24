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
    .then(res => res.data)
    .catch(err => {
      if (err.response) {
        const data = err.response.data || {};
        if (err.response.status === 401) {
          throw new AuthError(
            data.error === 'No token provided'
              ? 'Please sign in to continue checkout.'
              : 'Your session has expired. Please sign in again.'
          );
        }
        if (err.response.status === 404) {
          throw new Error(
            data.error === 'Route not found'
              ? 'Checkout service unavailable. Ensure the backend is running and up to date.'
              : data.error || 'Resource not found'
          );
        }
        const error = new Error(data.error || `Request failed (${err.response.status})`);
        if (data.detail) error.detail = data.detail;
        if (data.verified === false) error.verified = false;
        throw error;
      }
      throw err;
    });

export const getCheckoutConfig = async () => {
  try {
    return await handleResponse(api.get(`${getApiBase()}/api/checkout/config`));
  } catch (err) {
    if (err instanceof AuthError) throw err;
    return {
      freeDeliveryThreshold: 999,
      shippingCharge: 49,
      gstRate: 0.18,
      businessDaysMin: 5,
      businessDaysMax: 7,
    };
  }
};

export const previewCheckout = (payload) =>
  handleResponse(api.post(`${getApiBase()}/api/checkout/preview`, payload));

export const validateCoupon = (code, subtotal) =>
  handleResponse(api.post(`${getApiBase()}/api/coupons/validate`, { code, subtotal }));

export const getAddresses = () =>
  handleResponse(api.get(`${getApiBase()}/api/addresses`));

export const createAddress = (address) =>
  handleResponse(api.post(`${getApiBase()}/api/addresses`, address));

export const updateAddress = (id, address) =>
  handleResponse(api.put(`${getApiBase()}/api/addresses/${id}`, address));

export const deleteAddress = (id) =>
  handleResponse(api.delete(`${getApiBase()}/api/addresses/${id}`));

export const setDefaultAddress = (id) =>
  handleResponse(api.patch(`${getApiBase()}/api/addresses/${id}/default`));

export const placeOrder = (payload) =>
  handleResponse(api.post(`${getApiBase()}/api/orders`, payload));

export const getOrder = (id) =>
  handleResponse(api.get(`${getApiBase()}/api/orders/${id}`));

export const getOrderByNumber = (orderNumber) =>
  handleResponse(api.get(`${getApiBase()}/api/orders/track/${orderNumber}`));

export const getMyOrders = () =>
  handleResponse(api.get(`${getApiBase()}/api/orders`));

export const getAdminOrders = () =>
  handleResponse(api.get(`${getApiBase()}/api/admin/orders`));

export const markOrderReceived = (orderId) =>
  handleResponse(api.patch(`${getApiBase()}/api/orders/${orderId}/received`));

export const createStripeCheckoutSession = (amount, { customerEmail, successUrl, cancelUrl } = {}) =>
  handleResponse(
    api.post(`${getApiBase()}/api/payments/stripe/create-checkout-session`, {
      amount,
      customerEmail,
      successUrl,
      cancelUrl,
    })
  );

export const verifyStripeSession = (sessionId) =>
  handleResponse(api.post(`${getApiBase()}/api/payments/stripe/verify-session`, { sessionId }));
