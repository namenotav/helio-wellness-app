// User-Friendly Error Display Service
// Shows errors to users in a friendly way

class ErrorDisplayService {
  constructor() {
    this.errorQueue = [];
    this.isShowing = false;
  }

  /**
   * Show error to user
   */
  showError(message, title = 'Oops!', type = 'error') {
    const errorData = {
      id: `error_${Date.now()}`,
      title: title,
      message: message,
      type: type, // 'error', 'warning', 'info'
      timestamp: Date.now()
    };

    this.errorQueue.push(errorData);
    this.processQueue();
  }

  /**
   * Show warning
   */
  showWarning(message, title = 'Heads up!') {
    this.showError(message, title, 'warning');
  }

  /**
   * Show info
   */
  showInfo(message, title = 'Info') {
    this.showError(message, title, 'info');
  }

  /**
   * Show success
   */
  showSuccess(message, title = 'Success!') {
    this.showError(message, title, 'success');
  }

  /**
   * Process error queue
   */
  processQueue() {
    if (this.isShowing || this.errorQueue.length === 0) {
      return;
    }

    this.isShowing = true;
    const error = this.errorQueue.shift();

    // Create toast notification
    this.createToast(error);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.isShowing = false;
      this.processQueue();
    }, 5000);
  }

  /**
   * Create toast notification element
   */
  createToast(error) {
    // Check if toast container exists
    let container = document.getElementById('error-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'error-toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        max-width: 300px;
      `;
      document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${error.type}`;
    toast.style.cssText = `
      background: ${this.getBackgroundColor(error.type)};
      color: white;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;

    // Create structure safely without innerHTML (XSS protection)
    const container = document.createElement('div');
    container.style.cssText = 'display: flex; align-items: start; gap: 12px;';
    
    const icon = document.createElement('div');
    icon.style.fontSize = '24px';
    icon.textContent = this.getIcon(error.type);
    
    const content = document.createElement('div');
    content.style.flex = '1';
    
    const title = document.createElement('div');
    title.style.cssText = 'font-weight: 600; margin-bottom: 4px;';
    title.textContent = error.title;
    
    const message = document.createElement('div');
    message.style.cssText = 'font-size: 14px; opacity: 0.9;';
    message.textContent = error.message;
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'background: none; border: none; color: white; cursor: pointer; font-size: 20px;';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => toast.remove();
    
    content.appendChild(title);
    content.appendChild(message);
    container.appendChild(icon);
    container.appendChild(content);
    container.appendChild(closeBtn);
    toast.appendChild(container);

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 5000);

    // Add animation styles if not exists
    if (!document.getElementById('error-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'error-toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(400px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Get background color for error type
   */
  getBackgroundColor(type) {
    const colors = {
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      success: '#10b981'
    };
    return colors[type] || colors.error;
  }

  /**
   * Get icon for error type
   */
  getIcon(type) {
    const icons = {
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      success: '✅'
    };
    return icons[type] || icons.error;
  }

  /**
   * Wrap console.error to show user-friendly messages
   */
  interceptConsoleErrors() {
    const originalError = console.error;
    console.error = (...args) => {
      // Call original
      originalError.apply(console, args);
      
      // Show user-friendly message
      const message = args.join(' ');
      if (!message.includes('[Internal]')) {
        this.showError('Something went wrong. We\'re working on it!');
      }
    };
  }
}

const errorDisplayService = new ErrorDisplayService();
export default errorDisplayService;



