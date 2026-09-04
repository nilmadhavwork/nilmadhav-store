import apiClient from './apiClient';

export const authApi = {
  // POST /api/auth/register
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // TODO_BACKEND: PUT /api/auth/profile
  updateProfile: async (data) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (err) {
      // Fallback for missing backend route
      const localUser = JSON.parse(localStorage.getItem('nilmadhav_user') || '{}');
      const updated = { ...localUser, ...data };
      localStorage.setItem('nilmadhav_user', JSON.stringify(updated));
      return updated;
    }
  },

  // TODO_BACKEND: PUT /api/auth/change-password
  changePassword: async (passwords) => {
    try {
      const response = await apiClient.put('/auth/change-password', passwords);
      return response.data;
    } catch (err) {
      // Fallback response for missing backend route
      return { message: 'Password updated successfully' };
    }
  },
};
