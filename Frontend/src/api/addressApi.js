import apiClient from './apiClient';

export const addressApi = {
  // GET /api/addresses
  getMyAddresses: async () => {
    const response = await apiClient.get('/addresses');
    return response.data;
  },

  // GET /api/addresses/:id
  getById: async (id) => {
    const response = await apiClient.get(`/addresses/${id}`);
    return response.data;
  },

  // POST /api/addresses
  create: async (addressData) => {
    const response = await apiClient.post('/addresses', addressData);
    return response.data;
  },

  // PUT /api/addresses/:id
  update: async (id, addressData) => {
    const response = await apiClient.put(`/addresses/${id}`, addressData);
    return response.data;
  },

  // DELETE /api/addresses/:id
  delete: async (id) => {
    const response = await apiClient.delete(`/addresses/${id}`);
    return response.data;
  },
};
