import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import LandingPage from './pages/LandingPage'
import NewDashboard from './pages/NewDashboard'
const AdminSupportDashboard = lazy(() => import('./pages/AdminSupportDashboard'))
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCanceled from './pages/PaymentCanceled'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import CookieConsent from './components/CookieConsent'
import { analytics } from './services/analyticsService'

function App() {
  useEffect(() => {
    // GDPR COMPLIANCE: Only initialize analytics if user has consented
    const checkConsent = () => {
      const consent = localStorage.getItem('cookieConsent');
      if (consent === 'accepted') {
        analytics.initGoogleAnalytics();
        analytics.trackPageView('App_Start');
      }
    };
    
    // Check immediately
    checkConsent();
    
    // Listen for consent changes
    const consentHandler = () => checkConsent();
    window.addEventListener('cookieConsentChanged', consentHandler);
    
    return () => window.removeEventListener('cookieConsentChanged', consentHandler);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<NewDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin-support" element={<AdminSupportDashboard />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
          </Routes>
        </Suspense>
        <Toast />
        <CookieConsent />
      </Router>
    </ErrorBoundary>
  )
}

export default App

