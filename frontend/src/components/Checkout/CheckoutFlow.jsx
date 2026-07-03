import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsCartX } from 'react-icons/bs';
import { MdClose } from 'react-icons/md';
import CheckoutProgress from './CheckoutProgress';
import CartSummary from './CartSummary';
import CouponInput from './CouponInput';
import AddressForm from './AddressForm';
import PaymentMethods from './PaymentMethods';
import { loadCart, saveCart } from '../../utils/cartUtils';
import {
  getCheckoutConfig,
  previewCheckout,
  validateCoupon,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  placeOrder,
} from '../../services/checkoutService';
import { getCartItems, updateCartItem, removeCartItem } from '../../services/cartService';
import {
  initiateStripePayment,
  verifyStripeCheckout,
  savePendingCheckout,
  loadPendingCheckout,
  clearPendingCheckout,
} from '../../services/paymentService';
import {
  isLoggedIn,
  clearAuth,
  redirectToLogin,
  isTokenExpired,
  getToken,
  AUTH_CHANGED_EVENT,
} from '../../utils/authUtils';
import './Checkout.css';

const CheckoutFlow = ({ setShowCart, isPanel = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [config, setConfig] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const stripeReturnHandled = useRef(false);
  const updateTimerRef = useRef({});
  const removeTimerRef = useRef({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuthFailure = useCallback(
    (err) => {
      if (err?.isAuthError || err?.name === 'AuthError') {
        clearAuth();
        setSessionExpired(true);
        setPricing(null);
        showToast(err.message || 'Your session has expired. Please sign in again.', 'error');
        setTimeout(() => redirectToLogin(navigate, '/cart'), 1500);
        return true;
      }
      return false;
    },
    [navigate]
  );

  const refreshPricing = useCallback(async () => {
    if (!cartItems.length || !isLoggedIn()) return;
    setPricingLoading(true);
    try {
      const data = await previewCheckout({
        items: cartItems.map((i) => ({ productId: i.productId || i.id, quantity: i.quantity })),
        couponCode: appliedCoupon?.code || '',
      });
      setPricing(data.pricing);
      setSessionExpired(false);
    } catch (err) {
      if (!handleAuthFailure(err)) {
        showToast(err.message, 'error');
      }
    } finally {
      setPricingLoading(false);
    }
  }, [cartItems, appliedCoupon, handleAuthFailure]);

  useEffect(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      clearAuth();
      setSessionExpired(true);
      return;
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn()) {
        const items = loadCart();
        setCartItems(items);
        setLoadingCart(false);
        return;
      }

      try {
        const items = await getCartItems();
        setCartItems(items);
        saveCart(items);
      } catch (error) {
        console.error('Failed to load cart from server:', error.message || error);
        setCartItems([]);
        saveCart([]);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
    const onAuthChange = () => fetchCart();
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChange);
  }, []);

  useEffect(() => {
    getCheckoutConfig().then(setConfig).catch(() => {});
  }, []);

  const completeStripeReturn = useCallback(
    async (sessionId) => {
      const pending = loadPendingCheckout();
      if (!pending) {
        showToast('Checkout session expired. Please try again.', 'error');
        return;
      }

      setProcessing(true);
      try {
        const verification = await verifyStripeCheckout(sessionId);
        if (verification.verified && !verification.duplicate) {
          const order = await placeOrder({
            ...pending.orderPayload,
            paymentMethod: 'STRIPE',
            paymentStatus: 'COMPLETED',
            stripeSessionId: verification.sessionId,
            stripePaymentIntentId: verification.paymentIntentId,
          });
          clearPendingCheckout();
          saveCart([]);
          setCartItems([]);
          navigate('/order-success', {
            state: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              totalAmount: order.totalAmount,
              deliveryAddress: order.deliveryAddress,
              estimatedDeliveryEarliest: order.estimatedDeliveryEarliest,
              estimatedDeliveryLatest: order.estimatedDeliveryLatest,
              createdAt: order.createdAt,
            },
          });
          if (setShowCart) setShowCart(false);
        } else if (verification.duplicate) {
          clearPendingCheckout();
          showToast('Payment already processed', 'success');
          navigate('/order-success', {
            state: { orderId: verification.existingOrderId },
          });
        } else {
          showToast('Payment verification failed', 'error');
        }
      } catch (err) {
        if (!handleAuthFailure(err)) {
          showToast(err.message || 'Payment processing failed', 'error');
        }
      } finally {
        setProcessing(false);
        window.history.replaceState({}, '', '/cart');
      }
    },
    [navigate, setShowCart, handleAuthFailure]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeCheckout = params.get('stripe_checkout');
    const sessionId = params.get('session_id');

    if (stripeCheckout === 'cancelled') {
      clearPendingCheckout();
      showToast('Payment was cancelled', 'error');
      window.history.replaceState({}, '', '/cart');
      return;
    }

    if (stripeCheckout === 'success' && sessionId && isLoggedIn() && !stripeReturnHandled.current) {
      stripeReturnHandled.current = true;
      completeStripeReturn(sessionId);
    }
  }, [completeStripeReturn]);

  useEffect(() => {
    if (loadingCart || !isLoggedIn() || !cartItems.length) return;
    refreshPricing();
  }, [cartItems, appliedCoupon, refreshPricing, loadingCart]);

  const loadAddresses = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const list = await getAddresses();
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) setSelectedAddressId(def._id);
    } catch (err) {
      if (!handleAuthFailure(err)) {
        showToast(err.message, 'error');
      }
    }
  }, [handleAuthFailure]);

  useEffect(() => {
    if (step === 2) loadAddresses();
    const updateTimers = updateTimerRef.current;
    const removeTimers = removeTimerRef.current;
    return () => {
      Object.values(updateTimers).forEach(clearTimeout);
      Object.values(removeTimers).forEach(clearTimeout);
    };
  }, [step, loadAddresses]);

  const updateQuantity = async (productId, change) => {
    const updated = cartItems
      .map((item) => {
        if (item.id !== productId) return item;
        const newQty = item.quantity + change;
        if (newQty < 1) return item;
        if (newQty > (item.stock ?? 99)) {
          showToast(`Only ${item.stock} in stock`, 'error');
          return item;
        }
        return { ...item, quantity: newQty };
      })
      .filter(Boolean);

    const changedItem = updated.find((item) => item.id === productId);
    if (isLoggedIn() && changedItem) {
      const resolvedProductId = changedItem.productId || productId;
      clearTimeout(updateTimerRef.current[resolvedProductId]);
      updateTimerRef.current[resolvedProductId] = window.setTimeout(async () => {
        try {
          await updateCartItem(resolvedProductId, changedItem.quantity);
        } catch (error) {
          console.error('Failed to update cart item on server:', error.message || error);
        }
        delete updateTimerRef.current[resolvedProductId];
      }, 250);
    }

    saveCart(updated);
    setCartItems(updated);
  };

  const removeItem = async (productId) => {
    const updated = cartItems.filter((i) => i.id !== productId);
    if (isLoggedIn()) {
      const item = cartItems.find((i) => i.id === productId);
      const resolvedProductId = item?.productId || productId;
      clearTimeout(removeTimerRef.current[resolvedProductId]);
      removeTimerRef.current[resolvedProductId] = window.setTimeout(async () => {
        try {
          await removeCartItem(resolvedProductId);
        } catch (error) {
          console.error('Failed to remove cart item from server:', error.message || error);
        }
        delete removeTimerRef.current[resolvedProductId];
      }, 250);
    }

    saveCart(updated);
    setCartItems(updated);
  };

  const handleApplyCoupon = async (code) => {
    if (!isLoggedIn()) {
      showToast('Please sign in to apply a coupon', 'error');
      redirectToLogin(navigate, '/cart');
      return;
    }
    try {
      const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const result = await validateCoupon(code, subtotal);
      setAppliedCoupon(result);
      showToast('Coupon applied!');
    } catch (err) {
      if (!handleAuthFailure(err)) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleSaveAddress = async (form) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress._id, form);
        showToast('Address updated');
      } else {
        await createAddress(form);
        showToast('Address saved');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      await loadAddresses();
    } catch (err) {
      if (!handleAuthFailure(err)) {
        showToast(err.message, 'error');
      }
    }
  };

  const clientPricing = () => {
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const couponDiscount = appliedCoupon?.discountAmount || 0;
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const threshold = config?.freeDeliveryThreshold ?? 999;
    const shipping = afterCoupon >= threshold ? 0 : (config?.shippingCharge ?? 49);
    const gst = config?.gstRate ?? 0.18;
    const taxAmount = Math.round((afterCoupon + shipping) * gst * 100) / 100;
    const totalAmount = Math.round((afterCoupon + shipping + taxAmount) * 100) / 100;
    return { subtotal, couponDiscount, shippingCharge: shipping, taxAmount, totalAmount, isFreeDelivery: shipping === 0 };
  };

  const displayPricing = pricing || (config ? { ...clientPricing(), estimatedDelivery: null } : null);

  const placeOrderPayload = (extra = {}) => ({
    items: cartItems.map((i) => ({ productId: i.productId || i.id, quantity: i.quantity })),
    addressId: selectedAddressId,
    couponCode: appliedCoupon?.code || '',
    paymentMethod: extra.paymentMethod || paymentMethod,
    paymentStatus: extra.paymentStatus || 'PENDING',
    stripeSessionId: extra.stripeSessionId || null,
    stripePaymentIntentId: extra.stripePaymentIntentId || null,
  });

  const hasOutOfStockItems = cartItems.some((item) => (item.stock ?? 0) <= 0);

  const finalizeOrder = async (extra) => {
    const order = await placeOrder(placeOrderPayload(extra));
    saveCart([]);
    setCartItems([]);
    navigate('/order-success', {
      state: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryEarliest: order.estimatedDeliveryEarliest,
        estimatedDeliveryLatest: order.estimatedDeliveryLatest,
        createdAt: order.createdAt,
      },
    });
    if (setShowCart) setShowCart(false);
  };

  const handlePlaceOrder = async () => {
    if (hasOutOfStockItems) {
      showToast('Remove out-of-stock items before placing the order', 'error');
      setStep(1);
      return;
    }

    if (!selectedAddressId) {
      showToast('Select a delivery address', 'error');
      return;
    }

    setProcessing(true);
    try {
      const total = Number(displayPricing?.totalAmount) || 0;

      if (paymentMethod === 'COD') {
        await finalizeOrder({ paymentMethod: 'COD', paymentStatus: 'PENDING' });
        return;
      }

      const stripeMethod =
        paymentMethod === 'CREDIT_CARD' ||
        paymentMethod === 'DEBIT_CARD' ||
        paymentMethod === 'UPI' ||
        paymentMethod === 'NET_BANKING';

      if (stripeMethod) {
        if (total < 50) {
          showToast('Order total must be at least ₹50 for online payment (Stripe minimum)', 'error');
          setProcessing(false);
          return;
        }

        const addr = addresses.find((a) => a._id === selectedAddressId);
        if (!addr?.mobile) {
          showToast('Delivery address must include a valid mobile number', 'error');
          setProcessing(false);
          return;
        }

        try {
          const userEmail = localStorage.getItem('currentUser')
            ? JSON.parse(localStorage.getItem('currentUser') || '{}')?.username
            : '';

          savePendingCheckout({
            orderPayload: placeOrderPayload({ paymentMethod, paymentStatus: 'PENDING' }),
          });

          await initiateStripePayment({
            amount: total,
            customerEmail: userEmail,
          });
        } catch (error) {
          clearPendingCheckout();
          showToast(error.message || 'Failed to initiate payment', 'error');
          setProcessing(false);
        }
        return;
      }

      await finalizeOrder({ paymentMethod, paymentStatus: 'COMPLETED' });
    } catch (err) {
      if (!handleAuthFailure(err)) {
        showToast(err.message || 'Failed to place order', 'error');
      }
      setProcessing(false);
    }
  };

  const goNext = () => {
    if (step === 1) {
      if (!cartItems.length) return;
      if (hasOutOfStockItems) {
        showToast('Remove out-of-stock items before continuing checkout', 'error');
        return;
      }
      if (!isLoggedIn()) {
        showToast('Please sign in to continue checkout', 'error');
        redirectToLogin(navigate, '/cart');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedAddressId) {
        showToast('Select a delivery address', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  if (!cartItems.length && step === 1) {
    return (
      <div className={`checkout-flow ${isPanel ? 'cart-panel-mode' : ''}`}>
        <div className="empty-checkout">
          <BsCartX />
          <h2>Your cart is empty</h2>
          <p>Add products to start checkout</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-block', width: 'auto', marginTop: 16 }}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`checkout-flow ${isPanel ? '' : ''}`}>
      {toast && <div className={`checkout-toast ${toast.type}`}>{toast.message}</div>}

      {!isPanel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24 }}>Checkout</h1>
          <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
            Continue Shopping
          </Link>
        </div>
      )}

      <CheckoutProgress currentStep={step} />

      <div className="checkout-grid">
        <div className="checkout-main">
          {step === 1 && (
            <>
              <h2 style={{ marginBottom: 16 }}>Cart Review</h2>
              {cartItems.map((item) => (
                <div className="cart-item-row" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="details">
                    <strong>{item.name}</strong>
                    <p style={{ color: 'var(--checkout-muted)', fontSize: 14 }}>
                      ₹{item.price.toLocaleString('en-IN')} each
                    </p>
                    <div className="qty-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.stock <= 0 || item.quantity >= (item.stock ?? 99)}
                      >
                        +
                      </button>
                      <button type="button" onClick={() => removeItem(item.id)} style={{ marginLeft: 8, color: '#f85149' }}>
                        <MdClose />
                      </button>
                    </div>
                    {item.stock <= 0 && (
                      <p style={{ color: '#f85149', fontSize: 12, marginTop: 6 }}>Out of stock - remove this item to continue</p>
                    )}
                    <p>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
              <CouponInput
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={() => setAppliedCoupon(null)}
                subtotal={cartItems.reduce((s, i) => s + i.price * i.quantity, 0)}
                disabled={!isLoggedIn() || sessionExpired}
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 style={{ marginBottom: 16 }}>Delivery Address</h2>
              {!showAddressForm && (
                <>
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''} ${addr.isDefault ? 'default' : ''}`}
                      onClick={() => setSelectedAddressId(addr._id)}
                      role="button"
                      tabIndex={0}
                    >
                      <strong>{addr.fullName}</strong>
                      <p>
                        {addr.houseNo}, {addr.street}, {addr.city}, {addr.state} {addr.pincode}
                      </p>
                      <p>{addr.mobile}</p>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddress(addr);
                            setShowAddressForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deleteAddress(addr._id);
                            showToast('Address deleted');
                            loadAddresses();
                          }}
                        >
                          Delete
                        </button>
                        {!addr.isDefault && (
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={async (e) => {
                              e.stopPropagation();
                              await setDefaultAddress(addr._id);
                              loadAddresses();
                            }}
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-secondary" onClick={() => { setEditingAddress(null); setShowAddressForm(true); }}>
                    + Add New Address
                  </button>
                </>
              )}
              {showAddressForm && (
                <AddressForm
                  initial={editingAddress}
                  onSubmit={handleSaveAddress}
                  onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }}
                />
              )}
            </>
          )}

          {step === 3 && (
            <>
              <h2 style={{ marginBottom: 16 }}>Payment</h2>
              <PaymentMethods
                method={paymentMethod}
                onMethodChange={setPaymentMethod}
              />
            </>
          )}

          {step === 4 && (
            <>
              <h2 style={{ marginBottom: 16 }}>Review & Confirm</h2>
              <div className="review-section">
                <h4>Delivery Address</h4>
                {selectedAddress && (
                  <p>
                    {selectedAddress.fullName}, {selectedAddress.houseNo}, {selectedAddress.street},{' '}
                    {selectedAddress.city}, {selectedAddress.state} {selectedAddress.pincode} — {selectedAddress.mobile}
                  </p>
                )}
              </div>
              <div className="review-section">
                <h4>Items ({cartItems.length})</h4>
                {cartItems.map((i) => (
                  <p key={i.id}>
                    {i.name} × {i.quantity} — ₹{(i.price * i.quantity).toLocaleString('en-IN')}
                  </p>
                ))}
              </div>
              <div className="review-section">
                <h4>Payment</h4>
                <p>{paymentMethod.replace(/_/g, ' ')}</p>
              </div>
              <p style={{ fontSize: 13, color: 'var(--checkout-muted)' }}>
                By placing this order, you agree to our terms. Please review all details before confirming.
              </p>
            </>
          )}

          <div className="checkout-nav">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={() => setStep((s) => s - 1)} disabled={processing}>
                Back
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                className="btn-primary"
                style={{ width: 'auto' }}
                onClick={goNext}
                disabled={step === 1 && hasOutOfStockItems}
              >
                Continue
              </button>
            ) : (
              <button type="button" className="btn-primary" style={{ width: 'auto' }} onClick={handlePlaceOrder} disabled={processing || hasOutOfStockItems}>
                {processing ? 'Placing Order...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        <CartSummary pricing={displayPricing} config={config} loading={pricingLoading && isLoggedIn()} />
      </div>
    </div>
  );
};

export default CheckoutFlow;
