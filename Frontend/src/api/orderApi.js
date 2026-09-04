import apiClient from './apiClient';

export const orderApi = {
  // POST /api/orders — place order from cart
  createOrder: async ({ addressId, paymentMethod }) => {
    const response = await apiClient.post('/orders', { addressId, paymentMethod });
    return response.data;
  },

  // GET /api/orders/my — customer's order history
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my');
    return response.data;
  },

  // GET /api/orders/:id — get order details (customer or admin)
  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // PUT /api/orders/:id/cancel — cancel an un-shipped order
  cancelOrder: async (id, cancellationReason) => {
    const response = await apiClient.put(`/orders/${id}/cancel`, { cancellationReason });
    return response.data;
  },

  // GET /api/orders — admin view all orders with filters
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // PUT /api/orders/:id/status — admin update order lifecycle
  updateStatus: async (id, orderStatus) => {
    const response = await apiClient.put(`/orders/${id}/status`, { orderStatus });
    return response.data;
  },

  // PUT /api/orders/:id/shipping — admin update Shiprocket details
  updateShipping: async (id, shippingData) => {
    const response = await apiClient.put(`/orders/${id}/shipping`, shippingData);
    return response.data;
  },
};
