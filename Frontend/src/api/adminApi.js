import apiClient from './apiClient';

export const adminApi = {
  // Aggregate high-level summary metrics directly from live backend models
  getDashboardStats: async () => {
    try {
      const [ordersRes, prodsRes, returnsRes] = await Promise.all([
        apiClient.get('/orders'),
        apiClient.get('/products?limit=1'),
        apiClient.get('/returns'),
      ]);

      const orders = ordersRes.data?.orders || (Array.isArray(ordersRes.data) ? ordersRes.data : []);
      const totalOrders = ordersRes.data?.totalResults || orders.length;
      const totalProducts = prodsRes.data?.totalResults || prodsRes.data?.products?.length || 0;
      const pendingOrders = orders.filter((o) =>
        ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus)
      ).length;
      const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
      const totalRevenue = orders
        .filter((o) => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const customerIds = new Set(
        orders.map((o) => (typeof o.userId === 'object' ? o.userId?._id : o.userId)).filter(Boolean)
      );

      return {
        totalProducts,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalCustomers: customerIds.size || (orders.length > 0 ? 1 : 0),
        totalRevenue,
      };
    } catch (err) {
      console.warn('Live dashboard aggregation fallback:', err.message);
      return {
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        totalCustomers: 0,
        totalRevenue: 0,
      };
    }
  },

  // Get customer users list aggregated from orders
  getCustomers: async () => {
    try {
      const res = await apiClient.get('/orders?limit=100');
      const orders = res.data?.orders || (Array.isArray(res.data) ? res.data : []);

      const customerMap = new Map();
      orders.forEach((o) => {
        const u = o.userId;
        const custId = typeof u === 'object' ? u?._id : u;
        if (custId) {
          if (!customerMap.has(custId)) {
            customerMap.set(custId, {
              _id: custId,
              name: (typeof u === 'object' && u?.name) ? u.name : (o.shippingAddress?.fullName || 'Customer'),
              email: (typeof u === 'object' && u?.email) ? u.email : 'N/A',
              phone: (typeof u === 'object' && u?.phone) ? u.phone : (o.shippingAddress?.phone || 'N/A'),
              role: (typeof u === 'object' && u?.role) ? u.role : 'CUSTOMER',
              isActive: true,
              ordersCount: 1,
              totalSpent: o.totalAmount || 0,
              createdAt: o.createdAt,
            });
          } else {
            const existing = customerMap.get(custId);
            existing.ordersCount += 1;
            existing.totalSpent += (o.totalAmount || 0);
          }
        }
      });

      if (customerMap.size > 0) {
        return Array.from(customerMap.values());
      }
      return [];
    } catch (err) {
      console.warn('Failed to load customers from orders:', err.message);
      return [];
    }
  },
};

