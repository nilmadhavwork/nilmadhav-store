import apiClient from './apiClient';

export const cartApi = {
  // GET /api/cart
  getCart: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  // POST /api/cart/items
  addItem: async (productId, quantity = 1) => {
    const response = await apiClient.post('/cart/items', { productId, quantity });
    return response.data;
  },

  // PUT /api/cart/items/:productId
  updateQuantity: async (productId, quantity) => {
    const response = await apiClient.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  // DELETE /api/cart/items/:productId
  removeItem: async (productId) => {
    const response = await apiClient.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // DELETE /api/cart
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  },
};
