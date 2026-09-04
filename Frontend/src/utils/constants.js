export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RTO',
];

export const SHIPPING_STATUSES = [
  'NOT_CREATED',
  'CREATED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RTO',
  'RETURNED',
];

export const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash upon delivery at your doorstep' },
  { id: 'RAZORPAY', label: 'Online Payment (Razorpay)', desc: 'UPI, Cards, Netbanking, Wallets via secure gateway' },
];

export const SAREE_FABRICS = [
  'Banarasi Silk',
  'Kanjivaram Silk',
  'Chanderi Silk',
  'Tussar Silk',
  'Organza',
  'Georgette',
  'Chiffon',
  'Cotton Silk',
  'Linen',
];

export const SAREE_COLORS = [
  'Red',
  'Crimson',
  'Maroon',
  'Royal Blue',
  'Emerald Green',
  'Gold',
  'Mustard Yellow',
  'Blush Pink',
  'Plum Purple',
  'Ivory White',
  'Black',
];

export const SAREE_OCCASIONS = [
  'Bridal & Wedding',
  'Festive Celebrations',
  'Reception & Party',
  'Puja & Traditional',
  'Casual & Office Wear',
];
