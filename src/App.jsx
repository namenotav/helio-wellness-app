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
    // Only track analytics - NO initialization
    analytics.initGoogleAnalytics();
    analytics.trackPageView('App_Start');
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

