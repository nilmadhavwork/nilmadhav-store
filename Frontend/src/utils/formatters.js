// Format price into Indian Rupee format (e.g. ₹9,999)
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format ISO date into human readable format (e.g. 04 Sep 2026, 05:30 PM)
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return d.toLocaleDateString('en-IN', options);
  } catch (e) {
    return dateString;
  }
};

// Calculate percentage discount
export const calculateDiscount = (price, discountPrice) => {
  if (!price || !discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

// Get status badge CSS class
export const getOrderStatusBadge = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'badge-success';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      return 'badge-info';
    case 'CONFIRMED':
    case 'PACKED':
      return 'badge-gold';
    case 'CANCELLED':
    case 'RTO':
      return 'badge-danger';
    case 'PENDING':
    default:
      return 'badge-warning';
  }
};

export const getPaymentStatusBadge = (status) => {
  switch (status) {
    case 'PAID':
      return 'badge-success';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return 'badge-info';
    case 'FAILED':
      return 'badge-danger';
    case 'PENDING':
    default:
      return 'badge-warning';
  }
};
