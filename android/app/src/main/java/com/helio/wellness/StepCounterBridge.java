package com.helio.wellness;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;

/**
 * Direct WebView JavaScript bridge for Step Counter Service
 * Bypasses Capacitor plugin system entirely
 */
public class StepCounterBridge {
    private static final String PREFS_NAME = "StepCounterPrefs";
    private Context context;

    public StepCounterBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public String startService() {
        try {
            android.util.Log.d("StepCounterBridge", "🚀 Starting foreground service...");
            
            Intent serviceIntent = new Intent(context, StepCounterForegroundService.class);
            
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            
            JSONObject result = new JSONObject();
            result.put("started", true);
            result.put("message", "Service started successfully");
            
            android.util.Log.d("StepCounterBridge", "✅ Service started successfully");
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("StepCounterBridge", "❌ Failed to start service", e);
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
            Intent serviceIntent = new Intent(context, StepCounterForegroundService.class);
            context.stopService(serviceIntent);
            
            JSONObject result = new JSONObject();
            result.put("stopped", true);
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("StepCounterBridge", "Failed to stop service", e);
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
    public String getSteps() {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            int steps = prefs.getInt("currentStepCount", 0);
            
            JSONObject result = new JSONObject();
            result.put("steps", steps);
            
            android.util.Log.d("StepCounterBridge", "📊 Current steps: " + steps);
            return result.toString();
            
        } catch (Exception e) {
            android.util.Log.e("StepCounterBridge", "Failed to get steps", e);
            try {
                JSONObject error = new JSONObject();
                error.put("steps", 0);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"steps\":0,\"error\":\"" + e.getMessage() + "\"}";
            }
        }
    }
}
