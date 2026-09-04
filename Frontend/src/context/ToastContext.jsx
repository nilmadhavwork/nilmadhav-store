import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = `${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message, title = 'Success') => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((message, title = 'Error') => addToast({ type: 'error', title, message }), [addToast]);
  const info = useCallback((message, title = 'Notice') => addToast({ type: 'info', title, message }), [addToast]);
  const warning = useCallback((message, title = 'Warning') => addToast({ type: 'warning', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="toast-container" role="region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={20} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {toast.type === 'error' && <AlertCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {toast.type === 'warning' && <AlertTriangle size={20} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            {toast.type === 'info' && <Info size={20} color="var(--color-info)" style={{ flexShrink: 0, marginTop: '2px' }} />}
            
            <div className="toast-content">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{ color: 'var(--color-text-light)', padding: '2px' }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
