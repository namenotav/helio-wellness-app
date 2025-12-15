package com.helio.wellness;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;

/**
 * Direct WebView JavaScript bridge for Health Monitoring Service
 * Bypasses Capacitor plugin system entirely
 */
public class HealthMonitoringBridge {
    private static final String PREFS_NAME = "HealthMonitoringPrefs";
    private Context context;

    public HealthMonitoringBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public String startService() {
        try {
            android.util.Log.d("HealthBridge", "🚀 Starting health monitoring foreground service...");
            
            Intent serviceIntent = new Intent(context, HealthMonitoringService.class);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            
            JSONObject result = new JSONObject();
            result.put("started", true);
            result.put("message", "Health monitoring service started successfully");
            
            android.util.Log.d("HealthBridge", "✅ Health monitoring service started");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("HealthBridge", "❌ Failed to start health monitoring service", e);
            try {
                JSONObject error = new JSONObject();
                error.put("started", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"started\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
        }
    }

    @JavascriptInterface
    public String stopService() {
        try {
            Intent serviceIntent = new Intent(context, HealthMonitoringService.class);
            context.stopService(serviceIntent);
            
            JSONObject result = new JSONObject();
            result.put("stopped", true);
            
            android.util.Log.d("HealthBridge", "Health monitoring service stopped");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("HealthBridge", "Failed to stop service", e);
            try {
                JSONObject error = new JSONObject();
                error.put("stopped", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"stopped\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
        }
    }

    @JavascriptInterface
    public String getHealthStatus() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            
            JSONObject status = new JSONObject();
            
            // Heart rate
            float heartRate = prefs.getFloat("currentHeartRate", 0);
            long heartRateTime = prefs.getLong("heartRateTimestamp", 0);
            status.put("heartRate", heartRate);
            status.put("heartRateTimestamp", heartRateTime);
            status.put("heartRateAvailable", heartRate > 0);
            
            // Movement tracking
            long lastMovementTime = prefs.getLong("lastMovementTime", System.currentTimeMillis());
            long stillnessDuration = System.currentTimeMillis() - lastMovementTime;
            status.put("lastMovementTime", lastMovementTime);
            status.put("stillnessDuration", stillnessDuration);
            status.put("stillnessMinutes", stillnessDuration / 60000);
            
            // Accelerometer variance
            float accelVariance = prefs.getFloat("accelVariance", 0);
            status.put("accelVariance", accelVariance);
            status.put("isMoving", accelVariance > 0.5f);
            
            // GPS location
            float latitude = prefs.getFloat("lastLatitude", 0);
            float longitude = prefs.getFloat("lastLongitude", 0);
            long locationTime = prefs.getLong("locationTimestamp", 0);
            String locationHistory = prefs.getString("locationHistory", "[]");
            status.put("latitude", latitude);
            status.put("longitude", longitude);
            status.put("locationTimestamp", locationTime);
            status.put("locationHistory", locationHistory);
            status.put("locationAvailable", latitude != 0 && longitude != 0);
            
            // Location stuck duration
            long locationStuckDuration = prefs.getLong("locationStuckDuration", 0);
            status.put("locationStuckDuration", locationStuckDuration);
            status.put("locationStuckHours", locationStuckDuration / (60 * 60 * 1000));
            
            return status.toString();
            
        } catch (Exception e) {
            android.util.Log.e("HealthBridge", "Error getting health status", e);
            try {
                JSONObject error = new JSONObject();
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"error\":\"Unknown error\"}";
            }
        }
    }

    @JavascriptInterface
    public String getAlertStatus() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            
            JSONObject alert = new JSONObject();
            alert.put("alertTriggered", prefs.getBoolean("alertTriggered", false));
            alert.put("alertType", prefs.getString("alertType", ""));
            alert.put("alertMessage", prefs.getString("alertMessage", ""));
            alert.put("alertTimestamp", prefs.getLong("alertTimestamp", 0));
            
            return alert.toString();
            
        } catch (Exception e) {
            android.util.Log.e("HealthBridge", "Error getting alert status", e);
            try {
                JSONObject error = new JSONObject();
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"error\":\"Unknown error\"}";
            }
        }
    }

    @JavascriptInterface
    public String dismissAlert() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putBoolean("alertTriggered", false)
                .putString("alertType", "")
                .putString("alertMessage", "")
                .apply();
            
            JSONObject result = new JSONObject();
            result.put("dismissed", true);
            
            android.util.Log.d("HealthBridge", "Alert dismissed by user");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("HealthBridge", "Error dismissing alert", e);
            try {
                JSONObject error = new JSONObject();
                error.put("dismissed", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"dismissed\":false,\"error\":\"Unknown error\"}";
            }
        }
    }
}
