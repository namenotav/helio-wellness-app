// Toast Notification Component - Non-blocking notifications
import { useState, useEffect } from 'react';
import './Toast.css';

let toastQueue = [];
let showToastCallback = null;

export const showToast = (message, type = 'info', duration = 3000) => {
  const toast = {
    id: Date.now() + Math.random(),
    message,
    type, // 'success', 'error', 'warning', 'info'
    duration
  };
  
  toastQueue.push(toast);
  if (showToastCallback) {
    showToastCallback();
  }
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    showToastCallback = () => {
      if (toastQueue.length > 0) {
        const newToast = toastQueue.shift();
        setToasts(prev => [...prev, newToast]);

        // Auto-remove after duration
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    return () => {
      showToastCallback = null;
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
        >
          <span className="toast-icon">{getIcon(toast.type)}</span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
