import React from 'react';

export const Spinner = ({ size = 'md', center = false, className = '' }) => {
  const sizeStyle = size === 'sm' ? { width: '18px', height: '18px', borderWidth: '2px' } : size === 'lg' ? { width: '42px', height: '42px', borderWidth: '3.5px' } : {};

  const spinnerEl = <div className={`spinner ${className}`} style={sizeStyle} />;

  if (center) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0', width: '100%' }}>
        {spinnerEl}
      </div>
    );
  }

  return spinnerEl;
};

export default Spinner;
