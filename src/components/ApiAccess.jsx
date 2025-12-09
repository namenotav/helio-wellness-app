import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import './ApiAccess.css';

const ApiAccess = ({ user, planType }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiCalls, setApiCalls] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  const hasApiAccess = planType === 'ultimate';
  const monthlyLimit = 1000;

  useEffect(() => {
    if (user && hasApiAccess) {
      loadApiKey();
    } else {
      setLoading(false);
    }
  }, [user, hasApiAccess]);

  const loadApiKey = async () => {
    try {
      const apiDoc = await getDoc(doc(db, 'apiKeys', user.uid));
      
      if (apiDoc.exists()) {
        const data = apiDoc.data();
        setApiKey(data.key);
        setApiCalls(data.callsThisMonth || 0);
      } else {
        // Generate new API key
        await generateNewApiKey();
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewApiKey = async () => {
    const randomString = Math.random().toString(36).substring(2, 15) + 
                        Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
    const newKey = `helio_${user.uid.substring(0, 8)}_${randomString}`;

    try {
      await setDoc(doc(db, 'apiKeys', user.uid), {
        key: newKey,
        userId: user.uid,
        callsThisMonth: 0,
        limit: monthlyLimit,
        createdAt: new Date(),
        lastUsed: null
      });

      setApiKey(newKey);
      setApiCalls(0);
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = async () => {
    if (!confirm('Regenerate API key? Your old key will stop working immediately.')) {
      return;
    }

    setLoading(true);
    await generateNewApiKey();
    setLoading(false);
  };

  if (!hasApiAccess) {
    return (
      <div style={{
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(217, 119, 6, 0.1))',
        borderRadius: '20px',
        border: '2px solid rgba(234, 179, 8, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔌</div>
        <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'white' }}>API Access</h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px', lineHeight: '1.6' }}>
          Integrate your health data with other apps. Upgrade to Ultimate plan to get API access with 1,000 calls/month.
        </p>
        <button
          onClick={() => window.location.href = '/#pricing'}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #eab308, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Upgrade to Ultimate
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
        Loading API credentials...
      </div>
    );
  }

  return (
    <div className="api-access-container" style={{
      padding: '30px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'white' }}>
        🔌 API Access
      </h3>

      {/* Usage Stats */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(217, 119, 6, 0.1))',
        border: '2px solid rgba(234, 179, 8, 0.3)',
        borderRadius: '15px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>
              API Calls This Month
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#eab308' }}>
              {apiCalls.toLocaleString()} / {monthlyLimit.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '48px' }}>📊</div>
        </div>
        
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(apiCalls / monthlyLimit) * 100}%`,
            height: '100%',
            background: apiCalls > monthlyLimit * 0.9 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #eab308, #d97706)',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '10px' }}>
          Resets on the 1st of each month
        </div>
      </div>

      {/* API Key */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          marginBottom: '10px',
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 'bold'
        }}>
          Your API Key
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={apiKey}
            readOnly
            style={{
              flex: 1,
              padding: '15px',
              background: 'rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}
          />
          <button
            onClick={copyApiKey}
            style={{
              padding: '15px 25px',
              background: copied ? '#10b981' : 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '100px',
              transition: 'all 0.2s'
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button
            onClick={regenerateKey}
            style={{
              padding: '15px 25px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#ef4444',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Regenerate
          </button>
        </div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.6)',
          marginTop: '8px'
        }}>
          ⚠️ Keep your API key secret. Never share it publicly or commit it to Git.
        </div>
      </div>

      {/* Quick Start */}
      <div style={{
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h4 style={{ fontSize: '18px', marginBottom: '15px', color: '#3b82f6', fontWeight: 'bold' }}>
          ⚡ Quick Start
        </h4>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '15px' }}>
          Use this code to fetch your health data:
        </p>
        <pre style={{
          padding: '15px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#a3e635',
          overflow: 'auto',
          lineHeight: '1.5'
        }}>
{`curl -H "x-api-key: ${apiKey}" \\
     https://helio-api.vercel.app/api/user-data`}
        </pre>
      </div>

      {/* API Endpoints */}
      <button
        onClick={() => setShowDocs(!showDocs)}
        style={{
          width: '100%',
          padding: '15px',
          background: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>📖 View Full API Documentation</span>
        <span>{showDocs ? '▲' : '▼'}</span>
      </button>

      {showDocs && (
        <div style={{
          marginTop: '20px',
          padding: '25px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h4 style={{ fontSize: '20px', marginBottom: '20px', color: 'white' }}>
            Available Endpoints
          </h4>

          <div style={{ marginBottom: '25px' }}>
            <div style={{
              padding: '8px 15px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#10b981',
              marginBottom: '10px'
            }}>
              GET /api/user-data
            </div>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', marginBottom: '10px' }}>
              Returns your complete health data (last 100 entries)
            </p>
            <pre style={{
              padding: '12px',
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#a3e635',
              overflow: 'auto'
            }}>
{`{
  "success": true,
  "data": [
    {
      "date": "2025-12-09",
      "steps": 8500,
      "calories": 2000,
      "weight": 75.5,
      "sleep": 7.5
    }
  ],
  "callsRemaining": 999
}`}
            </pre>
          </div>

          <div style={{
            padding: '15px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.85)'
          }}>
            <strong>📝 Notes:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>All requests require <code>x-api-key</code> header</li>
              <li>Rate limit: 1,000 calls per month</li>
              <li>Returns 429 error if limit exceeded</li>
              <li>Limit resets on 1st of each month</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiAccess;
