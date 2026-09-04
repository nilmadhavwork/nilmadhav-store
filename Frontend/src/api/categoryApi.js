import apiClient from './apiClient';

export const categoryApi = {
  // GET /api/categories
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // GET /api/categories/:slug
  getBySlug: async (slug) => {
    const response = await apiClient.get(`/categories/${slug}`);
    return response.data;
  },

  // POST /api/categories (Admin)
  create: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },

  // PUT /api/categories/:id (Admin)
  update: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // DELETE /api/categories/:id (Admin)
  delete: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
