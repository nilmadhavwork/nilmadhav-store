import apiClient from './apiClient';

export const returnApi = {
  // POST /api/returns — customer requests a return
  createReturn: async (returnData) => {
    const res = await apiClient.post('/returns', returnData);
    return res.data;
  },

  // GET /api/returns/my — customer's own return requests
  getMyReturns: async () => {
    const res = await apiClient.get('/returns/my');
    return res.data;
  },

  // GET /api/returns — admin only, all return requests (optional status filter)
  getAllReturns: async (params = {}) => {
    const res = await apiClient.get('/returns', { params });
    return res.data;
  },

  // GET /api/returns/:id — return details
  getReturnById: async (id) => {
    const res = await apiClient.get(`/returns/${id}`);
    return res.data;
  },

  // PUT /api/returns/:id/status — admin only, update status & optional reverseShipmentId
  updateStatus: async (id, status, reverseShipmentId = '') => {
    const payload = { status };
    if (reverseShipmentId) payload.reverseShipmentId = reverseShipmentId;
    const res = await apiClient.put(`/returns/${id}/status`, payload);
    return res.data;
  },
};

