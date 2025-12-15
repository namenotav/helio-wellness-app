import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import NewDashboard from './pages/NewDashboard'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCanceled from './pages/PaymentCanceled'
import CookieConsent from './components/CookieConsent'
import { analytics } from './services/analyticsService'
import { auth } from './config/firebase'
import subscriptionService from './services/subscriptionService'

function App() {
  useEffect(() => {
    // Initialize Google Analytics on app start
    analytics.initGoogleAnalytics();
    analytics.trackPageView('App_Start');

    // Verify subscription on app launch (if user is logged in)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        subscriptionService.verifySubscriptionWithServer(user.uid).catch(err => {
          console.error('Failed to verify subscription on app start:', err);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<NewDashboard />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-canceled" element={<PaymentCanceled />} />
      </Routes>
      <CookieConsent />
    </Router>
  )
}

export default App



