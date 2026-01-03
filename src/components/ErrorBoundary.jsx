import React from 'react';
import './ErrorBoundary.css';
import errorLogger from '../services/errorLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Don't set hasError for React #310 - let it pass through
    if (error.message && error.message.includes('#310')) {
      return { hasError: false }; // Don't show error screen
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // IGNORE React error #310 (too many re-renders) - suppress but don't reset
    if (error.message && error.message.includes('#310')) {
      console.warn('⚠️ React #310 detected - suppressing error...');
      // DON'T call setState - just return and ignore the error
      // This prevents the error screen but doesn't reset component tree
      return;
    }
    
    // Log error to errorLogger service
    errorLogger.logError({
      type: 'component_crash',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    // If onReset callback provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>
              {this.props.fallbackMessage || 
               "We're sorry, but this feature encountered an error. Don't worry, your data is safe."}
            </p>
            
            <div className="error-actions">
              <button 
                className="error-btn-primary" 
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button 
                className="error-btn-secondary" 
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Technical Details (Dev Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;



