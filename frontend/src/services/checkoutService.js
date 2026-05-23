import { AuthError, clearAuth } from '../utils/authUtils';

const getApiBase = () => {
  const raw = process.env.REACT_APP_API_URL;
  if (!raw) {
    throw new Error('API URL is not configured. Set REACT_APP_API_URL in frontend/.env');
  }
  return raw.replace(/\/+$/, '');
};

const buildUrl = (path) => `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    clearAuth();
    throw new AuthError(
      data.error === 'No token provided'
        ? 'Please sign in to continue checkout.'
        : 'Your session has expired. Please sign in again.'
    );
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        data.error === 'Route not found'
          ? 'Checkout service unavailable. Ensure the backend is running and up to date.'
          : data.error || 'Resource not found'
      );
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
};

export const getCheckoutConfig = async () => {
  try {
    const res = await fetch(buildUrl('/api/checkout/config'));
    return handleResponse(res);
  } catch (err) {
    if (err instanceof AuthError) throw err;
    // Fallback so cart UI still works if config endpoint is unreachable
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
  fetch(buildUrl('/api/checkout/preview'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then((r) => handleResponse(r));

export const validateCoupon = (code, subtotal) =>
  fetch(buildUrl('/api/coupons/validate'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ code, subtotal }),
  }).then((r) => handleResponse(r));

export const getAddresses = () =>
  fetch(buildUrl('/api/addresses'), { headers: authHeaders() }).then((r) => handleResponse(r));

export const createAddress = (address) =>
  fetch(buildUrl('/api/addresses'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(address),
  }).then((r) => handleResponse(r));

export const updateAddress = (id, address) =>
  fetch(buildUrl('/api/addresses/' + id), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(address),
  }).then((r) => handleResponse(r));

export const deleteAddress = (id) =>
  fetch(buildUrl('/api/addresses/' + id), {
    method: 'DELETE',
    headers: authHeaders(),
  }).then((r) => handleResponse(r));

export const setDefaultAddress = (id) =>
  fetch(buildUrl('/api/addresses/' + id + '/default'), {
    method: 'PATCH',
    headers: authHeaders(),
  }).then((r) => handleResponse(r));

export const placeOrder = (payload) =>
  fetch(buildUrl('/api/orders'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  }).then((r) => handleResponse(r));

export const getOrder = (id) =>
  fetch(buildUrl('/api/orders/' + id), { headers: authHeaders() }).then((r) => handleResponse(r));

export const getOrderByNumber = (orderNumber) =>
  fetch(buildUrl('/api/orders/track/' + orderNumber), {
    headers: authHeaders(),
  }).then((r) => handleResponse(r));

export const getMyOrders = () =>
  fetch(buildUrl('/api/orders'), { headers: authHeaders() }).then((r) => handleResponse(r));

export const createRazorpayOrder = (amount) =>
  fetch(buildUrl('/api/payments/razorpay/create-order'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  }).then((r) => handleResponse(r));

export const verifyRazorpayPayment = (paymentData) =>
  fetch(buildUrl('/api/payments/razorpay/verify'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(paymentData),
  }).then((r) => handleResponse(r));

export const checkPaymentStatus = (orderId) =>
  fetch(buildUrl(`/api/payments/razorpay/status/${orderId}`), {
    headers: authHeaders(),
  }).then((r) => handleResponse(r));
