import apiClient from './apiClient';

export const refundApi = {
  // GET /api/refunds/my — customer's own refunds
  getMyRefunds: async () => {
    const res = await apiClient.get('/refunds/my');
    return res.data;
  },

  // GET /api/refunds — admin only, all refunds (optional status filter)
  getAllRefunds: async (params = {}) => {
    const res = await apiClient.get('/refunds', { params });
    return res.data;
  },

  // POST /api/refunds — admin only, initiate a refund for an approved/received return
  // Body: { returnId }
  createRefund: async (refundData) => {
    const res = await apiClient.post('/refunds', refundData);
    return res.data;
  },

  // PUT /api/refunds/:id/complete — admin only, mark COD refund as completed
  // Body: { method? } ('BANK_TRANSFER' or 'UPI')
  completeRefund: async (id, method = 'BANK_TRANSFER') => {
    const res = await apiClient.put(`/refunds/${id}/complete`, { method });
    return res.data;
  },
};

