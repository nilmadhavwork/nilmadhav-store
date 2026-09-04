import apiClient from './apiClient';

export const paymentApi = {
  // POST /api/payments/razorpay/create-order
  createRazorpayOrder: async (orderId) => {
    const response = await apiClient.post('/payments/razorpay/create-order', { orderId });
    return response.data;
  },

  // POST /api/payments/razorpay/verify
  verifyRazorpayPayment: async (paymentData) => {
    // Ensure snake_case keys are sent to match backend controller:
    // { razorpay_order_id, razorpay_payment_id, razorpay_signature }
    const payload = {
      razorpay_order_id: paymentData.razorpay_order_id || paymentData.razorpayOrderId,
      razorpay_payment_id: paymentData.razorpay_payment_id || paymentData.razorpayPaymentId,
      razorpay_signature: paymentData.razorpay_signature || paymentData.razorpaySignature,
    };
    const response = await apiClient.post('/payments/razorpay/verify', payload);
    return response.data;
  },

  // POST /api/payments/cod/confirm (Admin only)
  confirmCodPayment: async (orderId) => {
    const response = await apiClient.post('/payments/cod/confirm', { orderId });
    return response.data;
  },

  // GET /api/payments/order/:orderId
  getPaymentByOrder: async (orderId) => {
    const response = await apiClient.get(`/payments/order/${orderId}`);
    return response.data;
  },
};

