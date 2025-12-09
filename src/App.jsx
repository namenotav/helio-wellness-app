import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import NewDashboard from './pages/NewDashboard'
import { analytics } from './services/analyticsService'

function App() {
  useEffect(() => {
    // Initialize Google Analytics on app start
    analytics.initGoogleAnalytics();
    analytics.trackPageView('App_Start');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<NewDashboard />} />
      </Routes>
    </Router>
  )
}

export default App



