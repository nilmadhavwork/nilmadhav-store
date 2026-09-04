import apiClient from './apiClient';

export const wishlistApi = {
  // GET /api/wishlist
  getWishlist: async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  // POST /api/wishlist/:productId
  addItem: async (productId) => {
    const response = await apiClient.post(`/wishlist/${productId}`);
    return response.data;
  },

  // DELETE /api/wishlist/:productId
  removeItem: async (productId) => {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // POST /api/wishlist/:productId/move-to-cart
  moveToCart: async (productId) => {
    const response = await apiClient.post(`/wishlist/${productId}/move-to-cart`);
    return response.data;
  },
};
