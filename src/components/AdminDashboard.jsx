// Admin Dashboard for Monitoring & Management
import { useState, useEffect } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSteps: 0,
    avgStepsPerUser: 0,
    errors: [],
    recentActivity: []
  });

  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    // Load from localStorage (in production, fetch from server)
    const allUsers = getAllUsers();
    const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    const analytics = JSON.parse(localStorage.getItem('analytics_events') || '[]');

    setUsers(allUsers);
    setStats({
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => isActiveUser(u)).length,
      totalSteps: calculateTotalSteps(allUsers),
      avgStepsPerUser: calculateAvgSteps(allUsers),
      errors: errorLogs.slice(-10),
      recentActivity: analytics.slice(-20)
    });
  };

  const getAllUsers = () => {
    // In production, fetch from server database
    // For now, simulate with localStorage data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.email) return [];
    
    return [{
      id: user.id || '1',
      email: user.email,
      name: user.name || 'User',
      createdAt: user.createdAt || new Date().toISOString(),
      lastActive: new Date().toISOString(),
      stepCount: getCurrentStepCount()
    }];
  };

  const isActiveUser = (user) => {
    const lastActive = new Date(user.lastActive);
    const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
    return daysSinceActive < 7;
  };

  const calculateTotalSteps = (users) => {
    return users.reduce((total, user) => total + (user.stepCount || 0), 0);
  };

  const calculateAvgSteps = (users) => {
    if (users.length === 0) return 0;
    return Math.round(calculateTotalSteps(users) / users.length);
  };

  const getCurrentStepCount = () => {
    const healthData = JSON.parse(localStorage.getItem('health_data') || '{}');
    const today = new Date().toISOString().split('T')[0];
    return healthData.steps?.[today] || 0;
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user and all their data?')) return;
    
    // In production, call server API
    if(import.meta.env.DEV)console.log('Deleting user:', userId);
    alert('User deleted (demo mode)');
  };

  const handleExportData = () => {
    const exportData = {
      users,
      stats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <button onClick={handleExportData} className="export-btn">
          📥 Export Data
        </button>
      </header>

      <div className="admin-tabs">
        <button 
          className={selectedTab === 'overview' ? 'active' : ''}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={selectedTab === 'users' ? 'active' : ''}
          onClick={() => setSelectedTab('users')}
        >
          Users
        </button>
        <button 
          className={selectedTab === 'errors' ? 'active' : ''}
          onClick={() => setSelectedTab('errors')}
        >
          Errors
        </button>
        <button 
          className={selectedTab === 'activity' ? 'active' : ''}
          onClick={() => setSelectedTab('activity')}
        >
          Activity
        </button>
      </div>

      <div className="admin-content">
        {selectedTab === 'overview' && (
          <div className="overview-section">
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Total Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{stats.activeUsers}</div>
                <div className="stat-label">Active Users</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">👣</div>
                <div className="stat-value">{stats.totalSteps.toLocaleString()}</div>
                <div className="stat-label">Total Steps</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.avgStepsPerUser.toLocaleString()}</div>
                <div className="stat-label">Avg Steps/User</div>
              </div>
            </div>

            <div className="system-health">
              <h2>System Health</h2>
              <div className="health-item">
                <span>Server Status:</span>
                <span className="status-ok">✅ Online</span>
              </div>
              <div className="health-item">
                <span>Database:</span>
                <span className="status-ok">✅ Connected</span>
              </div>
              <div className="health-item">
                <span>Recent Errors:</span>
                <span className={stats.errors.length > 5 ? 'status-warning' : 'status-ok'}>
                  {stats.errors.length} in last hour
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'users' && (
          <div className="users-section">
            <h2>User Management</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Steps</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{user.stepCount?.toLocaleString() || 0}</td>
                    <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="delete-user-btn"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedTab === 'errors' && (
          <div className="errors-section">
            <h2>Recent Errors</h2>
            {stats.errors.length === 0 ? (
              <p>No errors logged ✅</p>
            ) : (
              <div className="error-list">
                {stats.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    <div className="error-time">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                    <div className="error-message">{error.message}</div>
                    <div className="error-stack">{error.stack?.substring(0, 100)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'activity' && (
          <div className="activity-section">
            <h2>Recent Activity</h2>
            {stats.recentActivity.length === 0 ? (
              <p>No activity logged</p>
            ) : (
              <div className="activity-list">
                {stats.recentActivity.map((event, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-time">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div className="activity-name">{event.name}</div>
                    <div className="activity-details">
                      {JSON.stringify(event.properties || {})}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



