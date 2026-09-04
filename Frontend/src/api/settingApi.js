import apiClient from './apiClient';

export const settingApi = {
  // GET /api/settings — public store settings
  getSettings: async () => {
    const res = await apiClient.get('/settings');
    return res.data;
  },

  // PUT /api/settings — admin only, update store settings
  updateSettings: async (settingsData) => {
    const res = await apiClient.put('/settings', settingsData);
    return res.data;
  },
};

export default settingApi;
