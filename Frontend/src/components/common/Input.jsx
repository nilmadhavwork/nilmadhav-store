import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      required = false,
      type = 'text',
      id,
      className = '',
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="form-group">
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {required && <span className="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`form-input ${error ? 'has-error' : ''} ${className}`}
          style={error ? { borderColor: 'var(--color-danger)' } : {}}
          {...props}
        />
        {error && <div className="form-error">{error}</div>}
        {hint && !error && <div className="form-hint">{hint}</div>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
