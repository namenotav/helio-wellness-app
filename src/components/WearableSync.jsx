import React, { useState, useEffect } from 'react';
import './WearableSync.css';

const WearableSync = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    // Load connected devices from storage
    const saved = localStorage.getItem('connectedWearables');
    if (saved) {
      setConnectedDevices(JSON.parse(saved));
    }
  }, []);

  const startScan = async () => {
    setScanning(true);
    setAvailableDevices([]);

    try {
      // Simulate Bluetooth scan
      // In production, use Capacitor Bluetooth plugin:
      // import { BLE } from '@capacitor-community/bluetooth-le';
      // await BLE.requestDevice({
      //   services: ['heart_rate', 'fitness_machine'],
      //   optionalServices: ['battery_service']
      // });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock discovered devices
      const mockDevices = [
        { id: 'fitbit_001', name: 'Fitbit Charge 5', type: 'fitbit', battery: 75, rssi: -45 },
        { id: 'garmin_002', name: 'Garmin Forerunner 945', type: 'garmin', battery: 60, rssi: -52 },
        { id: 'apple_003', name: 'Apple Watch Series 8', type: 'apple', battery: 85, rssi: -38 },
        { id: 'samsung_004', name: 'Galaxy Watch 5', type: 'samsung', battery: 70, rssi: -50 }
      ];

      setAvailableDevices(mockDevices);

    } catch (err) {
      if(import.meta.env.DEV)console.error('Bluetooth scan error:', err);
      alert('Failed to scan for devices. Please enable Bluetooth.');
    } finally {
      setScanning(false);
    }
  };

  const connectDevice = async (device) => {
    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Add to connected devices
      const newDevice = {
        ...device,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        data: {
          steps: Math.floor(Math.random() * 5000) + 5000,
          heartRate: Math.floor(Math.random() * 30) + 70,
          calories: Math.floor(Math.random() * 500) + 1500
        }
      };

      const updated = [...connectedDevices, newDevice];
      setConnectedDevices(updated);
      localStorage.setItem('connectedWearables', JSON.stringify(updated));

      // Remove from available
      setAvailableDevices(availableDevices.filter(d => d.id !== device.id));

      alert(`✓ Connected to ${device.name}`);

    } catch (err) {
      if(import.meta.env.DEV)console.error('Connection error:', err);
      alert(`Failed to connect to ${device.name}`);
    }
  };

  const disconnectDevice = (deviceId) => {
    if (confirm('Are you sure you want to disconnect this device?')) {
      const updated = connectedDevices.filter(d => d.id !== deviceId);
      setConnectedDevices(updated);
      localStorage.setItem('connectedWearables', JSON.stringify(updated));
    }
  };

  const syncDevice = async (deviceId) => {
    setSyncing(deviceId);

    try {
      // Simulate data sync
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update device data
      const updated = connectedDevices.map(device => {
        if (device.id === deviceId) {
          return {
            ...device,
            lastSync: new Date().toISOString(),
            data: {
              steps: Math.floor(Math.random() * 5000) + 5000,
              heartRate: Math.floor(Math.random() * 30) + 70,
              calories: Math.floor(Math.random() * 500) + 1500
            }
          };
        }
        return device;
      });

      setConnectedDevices(updated);
      localStorage.setItem('connectedWearables', JSON.stringify(updated));

    } catch (err) {
      if(import.meta.env.DEV)console.error('Sync error:', err);
      alert('Failed to sync device data');
    } finally {
      setSyncing(null);
    }
  };

  const getDeviceIcon = (type) => {
    const icons = {
      fitbit: '⌚',
      garmin: '🏃',
      apple: '🍎',
      samsung: '📱'
    };
    return icons[type] || '⌚';
  };

  const getSignalStrength = (rssi) => {
    if (rssi > -50) return '📶';
    if (rssi > -70) return '📶';
    return '📶';
  };

  if (!isOpen) return null;

  return (
    <div className="wearable-overlay" onClick={onClose}>
      <div className="wearable-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wearable-close" onClick={onClose}>✕</button>

        <div className="wearable-header">
          <div className="wearable-icon">⌚</div>
          <h2>Wearable Devices</h2>
          <p>Connect and sync your fitness trackers</p>
        </div>

        <div className="wearable-content">
          {/* Connected Devices Section */}
          <div className="connected-section">
            <div className="section-header">
              <h3>🔗 Connected Devices</h3>
              <span className="device-count">{connectedDevices.length}</span>
            </div>

            {connectedDevices.length === 0 ? (
              <div className="empty-state">
                <p>No devices connected yet</p>
                <span>👇 Scan to find devices</span>
              </div>
            ) : (
              <div className="devices-list">
                {connectedDevices.map(device => (
                  <div key={device.id} className="device-card connected">
                    <div className="device-info">
                      <div className="device-icon-large">
                        {getDeviceIcon(device.type)}
                      </div>
                      <div className="device-details">
                        <h4>{device.name}</h4>
                        <div className="device-meta">
                          <span>🔋 {device.battery}%</span>
                          <span>•</span>
                          <span>
                            {new Date(device.lastSync).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="device-data">
                      <div className="data-item">
                        <span className="data-icon">👟</span>
                        <span className="data-value">{device.data.steps}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-icon">❤️</span>
                        <span className="data-value">{device.data.heartRate}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-icon">🔥</span>
                        <span className="data-value">{device.data.calories}</span>
                      </div>
                    </div>

                    <div className="device-actions">
                      <button
                        className="action-btn sync-btn"
                        onClick={() => syncDevice(device.id)}
                        disabled={syncing === device.id}
                      >
                        {syncing === device.id ? '⏳' : '🔄'} Sync
                      </button>
                      <button
                        className="action-btn disconnect-btn"
                        onClick={() => disconnectDevice(device.id)}
                      >
                        ✕ Disconnect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scan Section */}
          <div className="scan-section">
            <button
              className="scan-btn"
              onClick={startScan}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <span className="scan-spinner">📡</span>
                  Scanning...
                </>
              ) : (
                <>
                  🔍 Scan for Devices
                </>
              )}
            </button>

            {availableDevices.length > 0 && (
              <div className="available-devices">
                <h3>📡 Available Devices</h3>
                <div className="devices-list">
                  {availableDevices.map(device => (
                    <div key={device.id} className="device-card available">
                      <div className="device-info">
                        <div className="device-icon-small">
                          {getDeviceIcon(device.type)}
                        </div>
                        <div className="device-details">
                          <h4>{device.name}</h4>
                          <div className="device-meta">
                            <span>{getSignalStrength(device.rssi)} Signal: {device.rssi}dBm</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="connect-btn"
                        onClick={() => connectDevice(device)}
                      >
                        + Connect
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="help-section">
            <h4>💡 Tips</h4>
            <ul>
              <li>Make sure Bluetooth is enabled on your device</li>
              <li>Keep your wearable close during pairing</li>
              <li>Some devices require app authorization first</li>
              <li>Auto-sync runs every 15 minutes when connected</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WearableSync;



