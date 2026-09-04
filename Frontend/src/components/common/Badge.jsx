import React from 'react';

export const Badge = ({
  children,
  variant = 'primary', // 'primary', 'gold', 'success', 'warning', 'danger', 'info'
  className = '',
  icon: Icon,
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

export default Badge;
