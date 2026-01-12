import React, { useState } from 'react';

/**
 * MINIMAL DASHBOARD - No useEffect, no complex initialization
 * This is a TEST to prove React #310 is caused by initialization complexity
 */
function NewDashboardMinimal() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏥 WellnessAI Dashboard</h1>
        <p>Welcome back! Your health data is loading...</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button 
          className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          ❤️ Health
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'home' && (
          <div>
            <h2>📊 Today's Stats</h2>
            <p>Steps: -- | Water: -- | Meals: --</p>
            <p style={{ marginTop: '20px', color: '#888' }}>Loading your health data...</p>
          </div>
        )}
        
        {activeTab === 'health' && (
          <div>
            <h2>❤️ Health Data</h2>
            <p>Loading health metrics...</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h2>⚙️ Settings</h2>
            <p>Loading settings...</p>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-container {
          padding: 20px;
          max-width: 100%;
          overflow-y: auto;
        }
        
        .dashboard-header {
          margin-bottom: 20px;
          text-align: center;
        }
        
        .dashboard-header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        
        .dashboard-header p {
          margin: 0;
          color: #666;
        }
        
        .dashboard-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .tab-button {
          padding: 10px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
          border-bottom: 3px solid transparent;
          color: #666;
          transition: all 0.3s;
        }
        
        .tab-button.active {
          color: #8B5FE8;
          border-bottom-color: #8B5FE8;
        }
        
        .dashboard-content {
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
}

export default NewDashboardMinimal;
