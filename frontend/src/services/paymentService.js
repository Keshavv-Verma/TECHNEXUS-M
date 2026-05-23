import { createRazorpayOrder, verifyRazorpayPayment, checkPaymentStatus } from './checkoutService';

const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const createOrder = async (amount) => {
  try {
    const result = await createRazorpayOrder(amount);
    return {
      success: true,
      orderId: result.orderId,
      amount: result.amount,
      keyId: result.keyId,
    };
  } catch (error) {
    throw new Error(error.message || 'Failed to create payment order');
  }
};

export const initiateRazorpayPayment = async (paymentData, onSuccess, onError) => {
  let razorpayInstance = null;
  let pollingInterval = null;
  let handlerCalled = false;

  try {
    const keyId = paymentData.keyId || RAZORPAY_KEY_ID;
    if (!keyId) {
      throw new Error('Razorpay Key not configured. Set REACT_APP_RAZORPAY_KEY_ID in .env');
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error('Failed to load Razorpay script');
    }

    const options = {
      key: keyId,
      amount: Math.round(paymentData.amount * 100),
      currency: 'INR',
      name: 'TechNexus',
      description: 'Order Payment',
      order_id: paymentData.orderId,
      handler: async (response) => {
        console.log('Razorpay Payment Success Handler Called:', response);
        handlerCalled = true;
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        try {
          const verification = await verifyPaymentSignature(response);
          console.log('Payment Verification Result:', verification);
          if (verification.verified) {
            console.log('Payment verified successfully, calling onSuccess');
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: paymentData.amount,
            });
          } else {
            console.error('Payment verification failed');
            onError('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          onError(error.message || 'Payment verification failed');
        }
      },
      prefill: {
        name: paymentData.customerName || '',
        email: paymentData.customerEmail || '',
        contact: paymentData.customerPhone || '',
      },
      notes: { products: paymentData.productNames || 'Cart Items' },
      theme: { color: '#10b981' },
      method: {
        upi: true,
        card: true,
        netbanking: true,
        wallet: true,
        emi: true,
        paylater: true,
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal dismissed');
          if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
          }
          if (!handlerCalled) {
            // Start polling for payment status as fallback
            console.log('Handler not called, starting payment status polling');
            startPolling(paymentData.orderId, onSuccess, onError);
          } else {
            onError('Payment was cancelled');
          }
        },
        escape: true,
        animation: true,
      },
      retry: {
        enabled: false,
      },
    };

    const startPolling = (orderId, successCallback, errorCallback) => {
      console.log('Starting payment status polling for order:', orderId);
      let pollCount = 0;
      const maxPolls = 20; // Poll for up to 2 minutes (20 * 6 seconds)
      
      pollingInterval = setInterval(async () => {
        pollCount++;
        console.log(`Polling attempt ${pollCount}/${maxPolls}`);
        
        try {
          const status = await checkPaymentStatus(orderId);
          console.log('Payment status check:', status);
          
          if (status.paid) {
            console.log('Payment detected via polling');
            clearInterval(pollingInterval);
            pollingInterval = null;
            
            if (status.duplicate) {
              errorCallback('Payment already processed');
            } else {
              // Verify the payment signature
              try {
                const verification = await verifyPaymentSignature({
                  razorpay_payment_id: status.paymentId,
                  razorpay_order_id: status.orderId,
                });
                
                if (verification.verified) {
                  successCallback({
                    razorpay_payment_id: status.paymentId,
                    razorpay_order_id: status.orderId,
                    amount: paymentData.amount,
                  });
                } else {
                  errorCallback('Payment verification failed');
                }
              } catch (error) {
                console.error('Verification error during polling:', error);
                errorCallback(error.message || 'Payment verification failed');
              }
            }
          } else if (pollCount >= maxPolls) {
            console.log('Polling timeout reached');
            clearInterval(pollingInterval);
            pollingInterval = null;
            errorCallback('Payment verification timeout. Please check your order status.');
          }
        } catch (error) {
          console.error('Polling error:', error);
          if (pollCount >= maxPolls) {
            clearInterval(pollingInterval);
            pollingInterval = null;
            errorCallback('Payment status check failed. Please contact support.');
          }
        }
      }, 6000); // Poll every 6 seconds
    };

    razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    onError(error.message || 'Failed to initiate payment');
  }
};

export const verifyPaymentSignature = async (paymentResponse) => {
  try {
    if (!paymentResponse.razorpay_payment_id || !paymentResponse.razorpay_order_id || !paymentResponse.razorpay_signature) {
      throw new Error('Invalid payment response');
    }

    const result = await verifyRazorpayPayment(paymentResponse);
    return {
      verified: result.verified,
      paymentId: result.paymentId,
      orderId: result.orderId,
    };
  } catch (error) {
    throw new Error(error.message || 'Payment verification failed');
  }
};
