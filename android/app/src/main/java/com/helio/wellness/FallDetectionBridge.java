package com.helio.wellness;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;

/**
 * Direct WebView JavaScript bridge for Fall Detection Service
 * Bypasses Capacitor plugin system entirely
 */
public class FallDetectionBridge {
    private static final String PREFS_NAME = "FallDetectionPrefs";
    private Context context;

    public FallDetectionBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public String startService() {
        try {
            android.util.Log.d("FallBridge", "🚀 Starting fall detection foreground service...");
            
            Intent serviceIntent = new Intent(context, FallDetectionService.class);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            
            JSONObject result = new JSONObject();
            result.put("started", true);
            result.put("message", "Fall detection service started successfully");
            
            android.util.Log.d("FallBridge", "✅ Fall detection service started successfully");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("FallBridge", "❌ Failed to start fall detection service", e);
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
            Intent serviceIntent = new Intent(context, FallDetectionService.class);
            context.stopService(serviceIntent);
            
            JSONObject result = new JSONObject();
            result.put("stopped", true);
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("FallBridge", "Failed to stop service", e);
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
    public String getFallStatus() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            boolean fallDetected = prefs.getBoolean("fallDetected", false);
            long timestamp = prefs.getLong("fallTimestamp", 0);
            float magnitude = prefs.getFloat("fallMagnitude", 0.0f);
            
            JSONObject result = new JSONObject();
            result.put("fallDetected", fallDetected);
            result.put("timestamp", timestamp);
            result.put("magnitude", magnitude);
            
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("FallBridge", "Failed to get fall status", e);
            try {
                JSONObject error = new JSONObject();
                error.put("fallDetected", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"fallDetected\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
        }
    }

    @JavascriptInterface
    public String resetFallFlag() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putBoolean("fallDetected", false).apply();
            
            JSONObject result = new JSONObject();
            result.put("reset", true);
            
            android.util.Log.d("FallBridge", "✅ Fall flag reset");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("FallBridge", "Failed to reset fall flag", e);
            try {
                JSONObject error = new JSONObject();
                error.put("reset", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"reset\":false,\"error\":\"" + e.getMessage() + "\"}";
            }
        }
    }
}
