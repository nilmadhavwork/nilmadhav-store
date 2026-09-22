import apiClient from './apiClient';

export const productApi = {
  // GET /api/products — supports category, fabric, color, minPrice, maxPrice, search, page, limit
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // GET /api/products/:slug
  getBySlug: async (slug, params = {}) => {
    const response = await apiClient.get(`/products/${slug}`, { params });
    return response.data;
  },

  // POST /api/products (Admin, multipart form-data)
  create: async (formData) => {
    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // PUT /api/products/:id (Admin, multipart form-data or JSON)
  update: async (id, data, isFormData = false) => {
    const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.put(`/products/${id}`, data, { headers });
    return response.data;
  },

  // DELETE /api/products/:id/images (Admin)
  deleteImage: async (productId, publicId) => {
    const response = await apiClient.delete(`/products/${productId}/images`, {
      data: { publicId },
    });
    return response.data;
  },

  // DELETE /api/products/:id (Admin)
  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
