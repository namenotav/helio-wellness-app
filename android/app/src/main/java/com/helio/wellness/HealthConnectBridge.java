package com.helio.wellness;

import android.webkit.JavascriptInterface;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import androidx.health.connect.client.HealthConnectClient;
import androidx.health.connect.client.permission.HealthPermission;
import androidx.health.connect.client.records.StepsRecord;
import androidx.health.connect.client.request.ReadRecordsRequest;
import androidx.health.connect.client.time.TimeRangeFilter;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import kotlinx.coroutines.*;
import org.json.JSONObject;

/**
 * Direct WebView JavaScript Interface for Health Connect
 * BYPASSES Capacitor plugin system entirely
 */
public class HealthConnectBridge {
    private Context context;
    private android.app.Activity activity;
    private HealthConnectClient healthConnectClient;

    public HealthConnectBridge(Context context, android.app.Activity activity) {
        this.context = context;
        this.activity = activity;
        
        try {
            if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) {
                healthConnectClient = HealthConnectClient.getOrCreate(context);
                android.util.Log.d("HealthConnectBridge", "✅ Client created via WebView bridge");
            }
        } catch (Exception e) {
            android.util.Log.e("HealthConnectBridge", "❌ Failed to create client", e);
        }
    }

    @JavascriptInterface
    public String checkAvailability() {
        try {
            int status = HealthConnectClient.getSdkStatus(context);
            JSONObject result = new JSONObject();
            result.put("available", status == HealthConnectClient.SDK_AVAILABLE);
            result.put("sdkStatus", status);
            android.util.Log.d("HealthConnectBridge", "📡 JS Interface called - Status: " + status);
            return result.toString();
        } catch (Exception e) {
            android.util.Log.e("HealthConnectBridge", "❌ Error in checkAvailability", e);
            try {
                JSONObject error = new JSONObject();
                error.put("available", false);
                error.put("error", e.getMessage());
                return error.toString();
            } catch (Exception je) {
                return "{\"available\":false,\"error\":\"Unknown error\"}";
            }
        }
    }

    @JavascriptInterface
    public void openHealthConnectSettings() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Try multiple intent approaches
                    Intent intent = new Intent();
                    intent.setAction("androidx.health.ACTION_MANAGE_HEALTH_PERMISSIONS");
                    intent.putExtra("android.intent.extra.PACKAGE_NAME", context.getPackageName());
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    activity.startActivity(intent);
                    android.util.Log.d("HealthConnectBridge", "🚀 Launched HC permissions via ACTION_MANAGE_HEALTH_PERMISSIONS");
                } catch (Exception e1) {
                    android.util.Log.e("HealthConnectBridge", "❌ Failed approach 1, trying fallback", e1);
                    try {
                        // Fallback: Open Health Connect app directly
                        Intent intent = context.getPackageManager().getLaunchIntentForPackage("com.google.android.apps.healthdata");
                        if (intent != null) {
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            activity.startActivity(intent);
                            android.util.Log.d("HealthConnectBridge", "🚀 Opened Health Connect app");
                        } else {
                            android.util.Log.e("HealthConnectBridge", "❌ Health Connect app not found");
                        }
                    } catch (Exception e2) {
                        android.util.Log.e("HealthConnectBridge", "❌ All approaches failed", e2);
                    }
                }
            }
        });
    }

    @JavascriptInterface
    public void requestPermissions() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                android.util.Log.d("HealthConnectBridge", "📱 Opening Health Connect app...");
                
                // Open Health Connect app via Kotlin helper
                boolean opened = HealthConnectPermissionHelper.INSTANCE.openHealthConnectApp(context);
                
                if (!opened) {
                    // Fallback: Open system app settings
                    try {
                        Intent settingsIntent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                        settingsIntent.setData(Uri.parse("package:" + context.getPackageName()));
                        settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        activity.startActivity(settingsIntent);
                        android.util.Log.d("HealthConnectBridge", "🔄 Opened system settings as fallback");
                    } catch (Exception e) {
                        android.util.Log.e("HealthConnectBridge", "❌ All methods failed", e);
                    }
                }
            }
        });
    }
    
    @JavascriptInterface
    public String checkPermissions() {
        if (healthConnectClient == null) {
            return "{\"hasAllPermissions\":false,\"error\":\"Client not available\"}";
        }

        try {
            android.util.Log.d("HealthConnectBridge", "🔍 Checking permissions via JS bridge");
            return "{\"hasAllPermissions\":false,\"message\":\"Permissions must be checked async - use requestPermissions first\"}";
        } catch (Exception e) {
            return "{\"hasAllPermissions\":false,\"error\":\"" + e.getMessage() + "\"}";
        }
    }
}
