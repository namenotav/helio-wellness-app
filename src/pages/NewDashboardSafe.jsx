import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getInitializedUser } from '../init';
import '../styles/NewDashboard.css';

export default function NewDashboardSafe() {
  const navigate = useNavigate();
  const user = getInitializedUser();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏥 WellnessAI - Safe Mode</h1>
        <p>Welcome {user?.email || user?.displayName || 'User'}!</p>
        <p style={{color: 'lime', marginTop: '20px'}}>
          ✅ This is a MINIMAL dashboard with ZERO useEffect hooks.
          <br/>
          If React #310 doesn't appear = problem is in one of NewDashboard's 26 useEffect hooks.
          <br/>
          If React #310 STILL appears = problem is elsewhere (routing, ErrorBoundary, etc).
        </p>
      </div>
      
      <div style={{padding: '20px', textAlign: 'center'}}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ← Back to Landing Page
        </button>
      </div>
    </div>
  );
}
