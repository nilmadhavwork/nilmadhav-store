import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary', 'gold', 'secondary', 'outline', 'outline-gold'
  size = 'md', // 'sm', 'md', 'lg'
  block = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const blockClass = block ? 'btn-block' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${blockClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner spinner-sm" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
